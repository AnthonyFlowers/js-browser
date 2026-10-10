import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const esbuildMock = vi.hoisted(() => ({
  initialize: vi.fn(),
  build: vi.fn(),
}));
const pluginSignals = vi.hoisted(() => [] as (AbortSignal | undefined)[]);

vi.mock("esbuild-wasm", () => esbuildMock);
vi.mock("esbuild-wasm/esbuild.wasm?url", () => ({ default: "esbuild.wasm" }));
vi.mock("./plugins/unpkg-path-plugin", () => ({
  unpkgPathPlugin: () => ({ name: "unpkg", setup: () => undefined }),
}));
vi.mock("./plugins/fetch-plugin", () => ({
  fetchPlugin: (_code: string, signal?: AbortSignal) => {
    pluginSignals.push(signal);
    return { name: "fetch", setup: () => undefined };
  },
}));

type BundlerModule = typeof import("./index");
let bundler: BundlerModule;

const built = { outputFiles: [{ text: "bundled()" }] };

describe("bundler", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    esbuildMock.initialize.mockReset().mockResolvedValue(undefined);
    esbuildMock.build.mockReset().mockResolvedValue(built);
    pluginSignals.length = 0;
    bundler = await import("./index");
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the bundled code", async () => {
    expect(await bundler.default("x")).toEqual({ code: "bundled()", err: "" });
  });

  it("returns build errors as err text", async () => {
    esbuildMock.build.mockRejectedValue(new Error("syntax error"));
    expect(await bundler.default("x")).toEqual({
      code: "",
      err: "syntax error",
    });
  });

  it("initializes esbuild once for concurrent bundles", async () => {
    await Promise.all([bundler.default("a"), bundler.default("b")]);
    expect(esbuildMock.initialize).toHaveBeenCalledTimes(1);
  });

  describe("overall deadline", () => {
    it("settles with a timeout error and aborts in-flight requests", async () => {
      esbuildMock.build.mockReturnValue(new Promise(() => undefined));
      const pending = bundler.default("x");
      await vi.advanceTimersByTimeAsync(bundler.BUNDLE_DEADLINE_MS);
      const result = await pending;
      expect(result.code).toBe("");
      expect(result.err).toMatch(
        new RegExp(`timed out after ${bundler.BUNDLE_DEADLINE_MS / 1000}s`)
      );
      expect(pluginSignals[0]?.aborted).toBe(true);
    });

    it("does not fire when the bundle finishes in time", async () => {
      const result = await bundler.default("x");
      expect(result.err).toBe("");
      expect(vi.getTimerCount()).toBe(0);
      expect(pluginSignals[0]?.aborted).toBe(false);
    });

    it("honours a custom deadline", async () => {
      esbuildMock.build.mockReturnValue(new Promise(() => undefined));
      const pending = bundler.default("x", 1000);
      await vi.advanceTimersByTimeAsync(1000);
      expect((await pending).err).toContain("timed out after 1s");
    });

    it("ignores a build that fails after the deadline", async () => {
      let rejectBuild: (error: Error) => void = () => undefined;
      esbuildMock.build.mockReturnValue(
        new Promise((_, reject) => {
          rejectBuild = reject;
        })
      );
      const pending = bundler.default("x", 1000);
      await vi.advanceTimersByTimeAsync(1000);
      await pending;
      rejectBuild(new Error("aborted late"));
      await vi.advanceTimersByTimeAsync(0);
    });
  });

  describe("esbuild initialize timeout", () => {
    it("reports a timeout and lets a later bundle reuse the pending initialize", async () => {
      let finishInit: () => void = () => undefined;
      esbuildMock.initialize.mockReturnValue(
        new Promise<void>((resolve) => {
          finishInit = resolve;
        })
      );
      const first = bundler.default("x", 10 * bundler.INIT_TIMEOUT_MS);
      await vi.advanceTimersByTimeAsync(bundler.INIT_TIMEOUT_MS);
      expect((await first).err).toContain("esbuild.wasm");
      expect(esbuildMock.build).not.toHaveBeenCalled();

      const second = bundler.default("x", 10 * bundler.INIT_TIMEOUT_MS);
      finishInit();
      expect(await second).toEqual({ code: "bundled()", err: "" });
      expect(esbuildMock.initialize).toHaveBeenCalledTimes(1);
    });

    it("starts a new initialize after the previous one failed", async () => {
      esbuildMock.initialize.mockRejectedValueOnce(
        new Error("download failed")
      );
      expect((await bundler.default("x")).err).toBe("download failed");
      expect(await bundler.default("x")).toEqual({
        code: "bundled()",
        err: "",
      });
      expect(esbuildMock.initialize).toHaveBeenCalledTimes(2);
    });
  });
});

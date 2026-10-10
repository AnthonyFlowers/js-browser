import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as esbuild from "esbuild-wasm";

const store = vi.hoisted(() => new Map<string, unknown>());
const axiosGet = vi.hoisted(() => vi.fn());
const cache = vi.hoisted(() => ({ hang: false }));

vi.mock("localforage", () => ({
  default: {
    createInstance: () => ({
      keys: async () => [...store.keys()],
      removeItem: async (key: string) => {
        store.delete(key);
      },
      getItem: async (key: string) => {
        if (cache.hang) await new Promise(() => undefined);
        return store.get(key) ?? null;
      },
      setItem: async (key: string, value: unknown) => {
        store.set(key, value);
        return value;
      },
    }),
  },
}));
vi.mock("axios", () => ({ default: { get: axiosGet } }));

import {
  fetchPlugin as fetchPluginStatic,
  MAX_ATTEMPTS,
  REQUEST_TIMEOUT_MS,
  RETRY_BASE_DELAY_MS,
} from "./fetch-plugin";

type LoadHandler = (
  args: esbuild.OnLoadArgs
) =>
  | Promise<esbuild.OnLoadResult | null | undefined | void>
  | esbuild.OnLoadResult
  | null
  | undefined
  | void;

const setupPlugin = (
  code: string,
  fetchPlugin: typeof fetchPluginStatic = fetchPluginStatic,
  signal?: AbortSignal
) => {
  const registered: { filter: RegExp; handler: LoadHandler }[] = [];
  const fakeBuild = {
    onLoad: (options: { filter: RegExp }, handler: LoadHandler) => {
      registered.push({ filter: options.filter, handler });
    },
  } as unknown as esbuild.PluginBuild;
  fetchPlugin(code, signal).setup(fakeBuild);

  const load = async (path: string) => {
    for (const { filter, handler } of registered) {
      if (filter.test(path)) {
        const result = await handler({ path } as esbuild.OnLoadArgs);
        if (result) return result;
      }
    }
    return undefined;
  };
  return { load };
};

describe("fetchPlugin", () => {
  beforeEach(() => {
    store.clear();
    cache.hang = false;
    axiosGet.mockReset();
  });

  it("returns the user code for the entry file without fetching", async () => {
    const { load } = setupPlugin("console.log(1)");
    expect(await load("index.js")).toEqual({
      loader: "jsx",
      contents: "console.log(1)",
    });
    expect(axiosGet).not.toHaveBeenCalled();
  });

  it("fetches a package file, derives resolveDir and caches it", async () => {
    axiosGet.mockResolvedValue({
      data: "export default 1;",
      request: { responseURL: "https://unpkg.com/pkg@1.0.0/lib/index.js" },
    });
    const { load } = setupPlugin("");
    const result = await load("https://unpkg.com/pkg");
    expect(result).toEqual({
      loader: "jsx",
      contents: "export default 1;",
      resolveDir: "/pkg@1.0.0/lib/",
    });
    expect(axiosGet).toHaveBeenCalledTimes(1);
    expect(store.get("v3:https://unpkg.com/pkg")).toEqual(result);
  });

  it("serves a cache hit without fetching", async () => {
    const cached = { loader: "jsx", contents: "cached", resolveDir: "/x/" };
    store.set("v3:https://unpkg.com/pkg", cached);
    const { load } = setupPlugin("");
    expect(await load("https://unpkg.com/pkg")).toEqual(cached);
    expect(axiosGet).not.toHaveBeenCalled();
  });

  it("wraps CSS files in JS that injects a style element", async () => {
    const css = 'body { content: "x"; }';
    axiosGet.mockResolvedValue({
      data: css,
      request: { responseURL: "https://unpkg.com/pkg@1.0.0/dist/a.css" },
    });
    const { load } = setupPlugin("");
    const result = await load("https://unpkg.com/pkg/dist/a.css");
    expect(result?.loader).toBe("jsx");
    expect(result?.contents).toContain("document.createElement");
    expect(result?.contents).toContain(JSON.stringify(css));
    expect(result?.resolveDir).toBe("/pkg@1.0.0/dist/");
  });

  it("loads .json files with the json loader as raw text", async () => {
    axiosGet.mockResolvedValue({
      data: '{"name":"pkg"}',
      request: { responseURL: "https://unpkg.com/pkg@1.0.0/package.json" },
    });
    const { load } = setupPlugin("");
    const result = await load("https://unpkg.com/pkg/package.json");
    expect(result).toEqual({
      loader: "json",
      contents: '{"name":"pkg"}',
      resolveDir: "/pkg@1.0.0/",
    });
    expect(axiosGet).toHaveBeenCalledWith(
      "https://unpkg.com/pkg/package.json",
      expect.objectContaining({ responseType: "text" })
    );
  });

  it("removes cache entries from older versions once", async () => {
    vi.resetModules();
    const { fetchPlugin } = await import("./fetch-plugin");
    store.set("https://unpkg.com/old", { loader: "jsx", contents: "a" });
    store.set("v2:https://unpkg.com/old2", { loader: "jsx", contents: "b" });
    store.set("v3:https://unpkg.com/keep", { loader: "jsx", contents: "c" });
    const { load } = setupPlugin("", fetchPlugin);
    await load("https://unpkg.com/keep");
    expect([...store.keys()]).toEqual(["v3:https://unpkg.com/keep"]);
  });

  describe("network failures", () => {
    const url = "https://unpkg.com/pkg";
    const ok = {
      data: "export default 1;",
      request: { responseURL: "https://unpkg.com/pkg@1.0.0/index.js" },
    };
    const timeoutError = () =>
      Object.assign(new Error("timeout of 30000ms exceeded"), {
        code: "ECONNABORTED",
      });
    const httpError = (status: number, statusText = "") =>
      Object.assign(new Error(`status ${status}`), {
        response: { status, statusText },
      });

    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    // Attach the rejection handler before timers advance so it is never reported as unhandled.
    const settle = async (promise: Promise<unknown>) => {
      const outcome = promise.then(
        () => undefined,
        (error: Error) => error
      );
      await vi.runAllTimersAsync();
      return outcome;
    };

    it("sets a request timeout on css and generic requests", async () => {
      axiosGet.mockResolvedValue(ok);
      const { load } = setupPlugin("");
      await load("https://unpkg.com/pkg");
      await load("https://unpkg.com/pkg/a.css");
      for (const [, config] of axiosGet.mock.calls) {
        expect(config).toMatchObject({ timeout: REQUEST_TIMEOUT_MS });
      }
    });

    it("retries a timeout with backoff and then succeeds", async () => {
      axiosGet
        .mockRejectedValueOnce(timeoutError())
        .mockRejectedValueOnce(httpError(503))
        .mockResolvedValueOnce(ok);
      const { load } = setupPlugin("");
      const pending = load(url);
      await vi.advanceTimersByTimeAsync(RETRY_BASE_DELAY_MS - 1);
      expect(axiosGet).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);
      expect(axiosGet).toHaveBeenCalledTimes(2);
      await vi.advanceTimersByTimeAsync(RETRY_BASE_DELAY_MS * 2);
      expect(await pending).toMatchObject({ contents: "export default 1;" });
      expect(axiosGet).toHaveBeenCalledTimes(3);
    });

    it("retries HTTP 429", async () => {
      axiosGet.mockRejectedValueOnce(httpError(429)).mockResolvedValueOnce(ok);
      const { load } = setupPlugin("");
      const pending = load(url);
      await vi.runAllTimersAsync();
      expect(await pending).toBeDefined();
      expect(axiosGet).toHaveBeenCalledTimes(2);
    });

    it("does not retry a 404 and names the URL and status", async () => {
      axiosGet.mockRejectedValue(httpError(404, "Not Found"));
      const { load } = setupPlugin("");
      const error = await settle(load(url));
      expect(error?.message).toBe(`Failed to fetch ${url}: HTTP 404 Not Found`);
      expect(axiosGet).toHaveBeenCalledTimes(1);
    });

    it("reports a timeout after the attempts are exhausted", async () => {
      axiosGet.mockRejectedValue(timeoutError());
      const { load } = setupPlugin("");
      const error = await settle(load(url));
      expect(error?.message).toBe(
        `Failed to fetch ${url}: timed out after ${REQUEST_TIMEOUT_MS / 1000}s (${MAX_ATTEMPTS} attempts)`
      );
      expect(axiosGet).toHaveBeenCalledTimes(MAX_ATTEMPTS);
      expect(store.size).toBe(0);
    });

    it("reports the last HTTP status when retries are exhausted", async () => {
      axiosGet.mockRejectedValue(httpError(502, "Bad Gateway"));
      const { load } = setupPlugin("");
      const error = await settle(load(url));
      expect(error?.message).toContain(`${url}: HTTP 502 Bad Gateway`);
      expect(axiosGet).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    });

    it("reports offline when the browser is offline", async () => {
      vi.stubGlobal("navigator", { onLine: false });
      axiosGet.mockRejectedValue(new Error("Network Error"));
      const { load } = setupPlugin("");
      const error = await settle(load(url));
      vi.unstubAllGlobals();
      expect(error?.message).toContain(`${url}: offline`);
    });

    it("reports a generic network error with its message", async () => {
      axiosGet.mockRejectedValue(new Error("Network Error"));
      const { load } = setupPlugin("");
      const error = await settle(load(url));
      expect(error?.message).toContain(`${url}: network error (Network Error)`);
    });

    it("stops retrying once the signal is aborted", async () => {
      const controller = new AbortController();
      axiosGet.mockRejectedValue(timeoutError());
      const { load } = setupPlugin("", fetchPluginStatic, controller.signal);
      const outcome = load(url).then(
        () => undefined,
        (error: unknown) => error
      );
      await vi.advanceTimersByTimeAsync(0);
      controller.abort(new Error("deadline"));
      await vi.runAllTimersAsync();
      expect(await outcome).toEqual(new Error("deadline"));
      expect(axiosGet).toHaveBeenCalledTimes(1);
    });

    it("passes the signal to axios", async () => {
      const controller = new AbortController();
      axiosGet.mockResolvedValue(ok);
      const { load } = setupPlugin("", fetchPluginStatic, controller.signal);
      await load(url);
      expect(axiosGet.mock.calls[0][1].signal).toBe(controller.signal);
    });

    it("falls back to the network when the cache hangs", async () => {
      vi.resetModules();
      const { fetchPlugin, CACHE_TIMEOUT_MS } = await import("./fetch-plugin");
      store.set("v3:" + url, { loader: "jsx", contents: "cached" });
      axiosGet.mockResolvedValue(ok);
      cache.hang = true;
      const { load } = setupPlugin("", fetchPlugin);
      const pending = load(url);
      await vi.advanceTimersByTimeAsync(CACHE_TIMEOUT_MS);
      cache.hang = false;
      expect(await pending).toMatchObject({ contents: "export default 1;" });
    });
  });
});

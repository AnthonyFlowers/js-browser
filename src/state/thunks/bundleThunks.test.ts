import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

const esbuildMock = vi.hoisted(() => ({
  initialize: vi.fn(),
  build: vi.fn(),
}));

vi.mock("esbuild-wasm", () => esbuildMock);
vi.mock("esbuild-wasm/esbuild.wasm?url", () => ({ default: "esbuild.wasm" }));
vi.mock("../../bundler/plugins/unpkg-path-plugin", () => ({
  unpkgPathPlugin: () => ({ name: "unpkg", setup: () => undefined }),
}));
vi.mock("../../bundler/plugins/fetch-plugin", () => ({
  fetchPlugin: () => ({ name: "fetch", setup: () => undefined }),
}));

import bundlesReducer from "../slices/bundlesSlice";
import { createBundle } from "./bundleThunks";
import { BUNDLE_DEADLINE_MS } from "../../bundler";

const makeStore = () =>
  configureStore({ reducer: { bundles: bundlesReducer } });

describe("createBundle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    esbuildMock.initialize.mockReset().mockResolvedValue(undefined);
    esbuildMock.build.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns loading to false with a visible error when a fetch never settles", async () => {
    esbuildMock.build.mockReturnValue(new Promise(() => undefined));
    const store = makeStore();
    const done = store.dispatch(createBundle({ cellId: "c3", input: "" }));
    expect(store.getState().bundles.c3?.loading).toBe(true);
    await vi.advanceTimersByTimeAsync(BUNDLE_DEADLINE_MS);
    await done;
    expect(store.getState().bundles.c3).toMatchObject({
      loading: false,
      code: "",
    });
    expect(store.getState().bundles.c3?.err).toContain("timed out");
  });

  it("keeps the newer result when an older hung bundle is superseded and settles late", async () => {
    let finishOld: (value: unknown) => void = () => undefined;
    esbuildMock.build
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finishOld = resolve;
        })
      )
      .mockResolvedValueOnce({ outputFiles: [{ text: "new()" }] });
    const store = makeStore();
    const oldRun = store.dispatch(createBundle({ cellId: "c", input: "old" }));
    await store.dispatch(createBundle({ cellId: "c", input: "new" }));
    finishOld({ outputFiles: [{ text: "old()" }] });
    await oldRun;
    expect(store.getState().bundles.c).toMatchObject({
      loading: false,
      code: "new()",
    });
  });
});

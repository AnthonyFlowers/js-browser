import { describe, expect, it } from "vitest";
import type * as esbuild from "esbuild-wasm";
import { unpkgPathPlugin } from "./unpkg-path-plugin";

type ResolveHandler = (
  args: esbuild.OnResolveArgs
) => esbuild.OnResolveResult | null | undefined;

interface Registered {
  filter: RegExp;
  handler: ResolveHandler;
}

const setupPlugin = () => {
  const registered: Registered[] = [];
  const fakeBuild = {
    onResolve: (options: { filter: RegExp }, handler: ResolveHandler) => {
      registered.push({ filter: options.filter, handler });
    },
  } as unknown as esbuild.PluginBuild;
  unpkgPathPlugin().setup(fakeBuild);

  const resolve = (
    path: string,
    resolveDir = ""
  ): esbuild.OnResolveResult | null | undefined => {
    const args = { path, resolveDir } as esbuild.OnResolveArgs;
    for (const { filter, handler } of registered) {
      if (filter.test(path)) {
        const result = handler(args);
        if (result) return result;
      }
    }
    return undefined;
  };
  return { registered, resolve };
};

describe("unpkgPathPlugin", () => {
  it("has a name and registers four onResolve handlers", () => {
    expect(unpkgPathPlugin().name).toBe("unpkg-path-plugin");
    expect(setupPlugin().registered).toHaveLength(4);
  });

  it("resolves the virtual root entry index.js", () => {
    const { resolve } = setupPlugin();
    expect(resolve("index.js")).toEqual({ path: "index.js", namespace: "a" });
  });

  it("resolves a bare package to unpkg", () => {
    const { resolve } = setupPlugin();
    expect(resolve("react")).toEqual({
      namespace: "a",
      path: "https://unpkg.com/react",
    });
    expect(resolve("lodash/debounce")).toEqual({
      namespace: "a",
      path: "https://unpkg.com/lodash/debounce",
    });
    expect(resolve("@scope/pkg")).toEqual({
      namespace: "a",
      path: "https://unpkg.com/@scope/pkg",
    });
  });

  it("resolves root-absolute imports to unpkg paths", () => {
    const { resolve } = setupPlugin();
    expect(resolve("/npm/x/index.js", "/pkg@1.0.0")).toEqual({
      namespace: "a",
      path: "https://unpkg.com/npm/x/index.js",
    });
  });

  it("resolves ./ relative to the unpkg resolveDir", () => {
    const { resolve } = setupPlugin();
    expect(resolve("./utils.js", "/pkg@1.0.0/lib")).toEqual({
      namespace: "a",
      path: "https://unpkg.com/pkg@1.0.0/lib/utils.js",
    });
  });

  it("resolves ../ relative to the unpkg resolveDir", () => {
    const { resolve } = setupPlugin();
    expect(resolve("../shared/x.js", "/pkg@1.0.0/lib")).toEqual({
      namespace: "a",
      path: "https://unpkg.com/pkg@1.0.0/shared/x.js",
    });
    expect(resolve("../../y.js", "/pkg@1.0.0/lib/deep")).toEqual({
      namespace: "a",
      path: "https://unpkg.com/pkg@1.0.0/y.js",
    });
  });
});

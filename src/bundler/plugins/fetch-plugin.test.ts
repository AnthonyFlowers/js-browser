import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as esbuild from "esbuild-wasm";

const store = vi.hoisted(() => new Map<string, unknown>());
const axiosGet = vi.hoisted(() => vi.fn());

vi.mock("localforage", () => ({
  default: {
    createInstance: () => ({
      keys: async () => [...store.keys()],
      removeItem: async (key: string) => {
        store.delete(key);
      },
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: unknown) => {
        store.set(key, value);
        return value;
      },
    }),
  },
}));
vi.mock("axios", () => ({ default: { get: axiosGet } }));

import { fetchPlugin as fetchPluginStatic } from "./fetch-plugin";

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
  fetchPlugin: typeof fetchPluginStatic = fetchPluginStatic
) => {
  const registered: { filter: RegExp; handler: LoadHandler }[] = [];
  const fakeBuild = {
    onLoad: (options: { filter: RegExp }, handler: LoadHandler) => {
      registered.push({ filter: options.filter, handler });
    },
  } as unknown as esbuild.PluginBuild;
  fetchPlugin(code).setup(fakeBuild);

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
      {
        responseType: "text",
      }
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
});

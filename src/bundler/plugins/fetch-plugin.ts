import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";

const fileCache = localforage.createInstance({
  name: "filecache",
});

// Bump when the shape of cached OnLoadResults changes (older entries are then ignored).
const CACHE_VERSION = "v3:";

// Drops entries written under older cache versions, once per page load.
let cleanup: Promise<void> | undefined;
const removeStaleEntries = () => {
  cleanup ??= fileCache
    .keys()
    .then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => fileCache.removeItem(key))
      )
    )
    .then(() => undefined)
    .catch(() => undefined);
  return cleanup;
};

const loaderFor = (path: string): esbuild.Loader =>
  /\.json$/.test(path) ? "json" : "jsx";

export const fetchPlugin = (inputCode: string): esbuild.Plugin => {
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /^index\.js$/ }, () => {
        return {
          loader: "jsx",
          contents: inputCode,
        };
      });

      // Cache lookup for every file; returning nothing falls through to the handlers below.
      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        await removeStaleEntries();
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          CACHE_VERSION + args.path
        );
        if (cachedResult) {
          return cachedResult;
        }
      });

      build.onLoad({ filter: /\.css$/ }, async (args: esbuild.OnLoadArgs) => {
        const { data, request } = await axios.get<string>(args.path);
        const contents = `
        const style = document.createElement("style");
        style.textContent = ${JSON.stringify(data)};
        document.head.appendChild(style);
        `;
        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents: contents,
          resolveDir: new URL("./", request.responseURL).pathname,
        };
        await fileCache.setItem(CACHE_VERSION + args.path, result);
        return result;
      });

      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        const { data, request } = await axios.get<string>(args.path, {
          responseType: "text",
        });
        const result: esbuild.OnLoadResult = {
          loader: loaderFor(args.path),
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname,
        };
        await fileCache.setItem(CACHE_VERSION + args.path, result);
        return result;
      });
    },
  };
};

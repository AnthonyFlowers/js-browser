import * as esbuild from "esbuild-wasm";

export const unpkgPathPlugin = (): esbuild.Plugin => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      // handle root entry
      build.onResolve({ filter: /^index\.js$/ }, () => {
        return { path: "index.js", namespace: "a" };
      });

      // handle relative module paths
      build.onResolve({ filter: /^\.+\// }, (args: esbuild.OnResolveArgs) => {
        return {
          namespace: "a",
          path: new URL(args.path, "https://unpkg.com" + args.resolveDir + "/")
            .href,
        };
      });

      // handle main file of a module (every remaining, i.e. bare, import)
      build.onResolve({ filter: /.*/ }, (args: esbuild.OnResolveArgs) => {
        return {
          namespace: "a",
          path: `https://unpkg.com/${args.path}`,
        };
      });
    },
  };
};

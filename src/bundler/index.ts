import * as esbuild from "esbuild-wasm";
// Vite emits the wasm from the installed package as a hashed asset under `base`, so the
// binary always matches the JS API version and is self-hosted (see ADR-009).
import wasmURL from "esbuild-wasm/esbuild.wasm?url";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";

// `initialize` may only be called once per page; memoize the promise so concurrent bundles share it.
let initialized: Promise<void> | undefined;
const ensureInitialized = () => {
  if (!initialized) {
    initialized = esbuild.initialize({ wasmURL }).catch((err) => {
      initialized = undefined; // allow a retry after a failed start (e.g. network error)
      throw err;
    });
  }
  return initialized;
};

const bundle = async (rawCode: string) => {
  try {
    await ensureInitialized();
    const result = await esbuild.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
      define: {
        "process.env.NODE_ENV": "'production'",
        global: "window",
      },
      // Relies on `_React` being imported by the `show()` prelude in use-cumulative-code.ts.
      jsxFactory: "_React.createElement",
      jsxFragment: "_React.Fragment",
    });
    return {
      code: result.outputFiles[0].text,
      err: "",
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        code: "",
        err: err.message,
      };
    } else {
      throw err;
    }
  }
};

export default bundle;

import * as esbuild from "esbuild-wasm";
// Vite emits the wasm from the installed package as a hashed asset under `base`, so the
// binary always matches the JS API version and is self-hosted (see ADR-009).
import wasmURL from "esbuild-wasm/esbuild.wasm?url";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";

// The wasm binary is about 12 MB, so allow a slow mobile download before giving up on a bundle.
export const INIT_TIMEOUT_MS = 60_000;
// Upper bound for one bundle (wasm start-up included) so `loading` always returns to false. Files
// already downloaded stay cached, so editing the cell to retry resumes where it stopped.
export const BUNDLE_DEADLINE_MS = 120_000;

// `initialize` may only be called once per page; memoize the promise so concurrent bundles share it.
let initialized: Promise<void> | undefined;
const startInitialize = () => {
  if (!initialized) {
    initialized = esbuild.initialize({ wasmURL }).catch((err) => {
      initialized = undefined; // allow a retry after a failed start (e.g. network error)
      throw err;
    });
  }
  return initialized;
};

// A timeout only stops waiting: esbuild rejects a second `initialize` while the first is pending, so
// a retry re-awaits the same promise (or starts a new one if it has since failed).
const ensureInitialized = () => {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(
            `Timed out after ${INIT_TIMEOUT_MS / 1000}s loading the bundler (esbuild.wasm). Edit the cell to try again.`
          )
        ),
      INIT_TIMEOUT_MS
    );
  });
  return Promise.race([startInitialize(), timeout]).finally(() =>
    clearTimeout(timer)
  );
};

const run = async (rawCode: string, signal: AbortSignal) => {
  await ensureInitialized();
  return esbuild.build({
    entryPoints: ["index.js"],
    bundle: true,
    write: false,
    plugins: [unpkgPathPlugin(), fetchPlugin(rawCode, signal)],
    define: {
      "process.env.NODE_ENV": "'production'",
      global: "globalThis",
    },
    // Relies on `_React` being imported by the `show()` prelude in use-cumulative-code.ts.
    jsxFactory: "_React.createElement",
    jsxFragment: "_React.Fragment",
  });
};

const bundle = async (rawCode: string, deadlineMs = BUNDLE_DEADLINE_MS) => {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(
        `Bundling timed out after ${deadlineMs / 1000}s. Packages already downloaded are cached; edit the cell to try again.`
      );
      controller.abort(error);
      reject(error);
    }, deadlineMs);
  });
  try {
    const result = await Promise.race([
      run(rawCode, controller.signal),
      deadline,
    ]);
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
  } finally {
    clearTimeout(timer!);
  }
};

export default bundle;

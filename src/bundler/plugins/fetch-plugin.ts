import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";

const fileCache = localforage.createInstance({
  name: "filecache",
});

// Per attempt, measured from request start. A ~750 KB file such as bulma.css needs only about
// 25 KB/s to finish, yet a stalled request still fails well before the overall bundle deadline.
export const REQUEST_TIMEOUT_MS = 30_000;
export const MAX_ATTEMPTS = 3;
// Backoff before retry n is RETRY_BASE_DELAY_MS * 2^(n-1): 500 ms, then 1000 ms.
export const RETRY_BASE_DELAY_MS = 500;
// IndexedDB can hang or throw on mobile Safari; the cache is an optimisation, so give up on it quickly.
export const CACHE_TIMEOUT_MS = 3_000;

const bestEffort = <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), CACHE_TIMEOUT_MS);
  });
  return Promise.race([operation().catch(() => fallback), timeout]).finally(
    () => clearTimeout(timer)
  );
};

interface RequestFailure {
  code?: string;
  message?: string;
  response?: { status?: number; statusText?: string };
}

const failureReason = (failure: RequestFailure) => {
  const status = failure.response?.status;
  if (status) {
    return `HTTP ${status}${failure.response?.statusText ? ` ${failure.response.statusText}` : ""}`;
  }
  if (failure.code === "ECONNABORTED" || failure.code === "ETIMEDOUT") {
    return `timed out after ${REQUEST_TIMEOUT_MS / 1000}s`;
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "offline";
  }
  return `network error${failure.message ? ` (${failure.message})` : ""}`;
};

const isTransient = (failure: RequestFailure) => {
  const status = failure.response?.status;
  return status === undefined || status === 429 || status >= 500;
};

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });

const get = async (
  url: string,
  signal?: AbortSignal,
  responseType?: "text"
) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await axios.get<string>(url, {
        ...(responseType && { responseType }),
        timeout: REQUEST_TIMEOUT_MS,
        signal,
      });
    } catch (error) {
      if (signal?.aborted) throw signal.reason;
      const failure = error as RequestFailure;
      if (!isTransient(failure) || attempt >= MAX_ATTEMPTS) {
        const attempts = attempt > 1 ? ` (${attempt} attempts)` : "";
        throw new Error(
          `Failed to fetch ${url}: ${failureReason(failure)}${attempts}`,
          { cause: error }
        );
      }
      await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1), signal);
    }
  }
};

// Bump when the shape of cached OnLoadResults changes (older entries are then ignored).
const CACHE_VERSION = "v3:";

// Drops entries written under older cache versions, once per page load.
let cleanup: Promise<void> | undefined;
const removeStaleEntries = () => {
  cleanup ??= bestEffort(async () => {
    const keys = await fileCache.keys();
    await Promise.all(
      keys
        .filter((key) => !key.startsWith(CACHE_VERSION))
        .map((key) => fileCache.removeItem(key))
    );
  }, undefined);
  return cleanup;
};

const cacheGet = (path: string) =>
  bestEffort(
    () => fileCache.getItem<esbuild.OnLoadResult>(CACHE_VERSION + path),
    null
  );

const cacheSet = (path: string, result: esbuild.OnLoadResult) =>
  bestEffort(() => fileCache.setItem(CACHE_VERSION + path, result), null);

const loaderFor = (path: string): esbuild.Loader =>
  /\.json$/.test(path) ? "json" : "jsx";

export const fetchPlugin = (
  inputCode: string,
  signal?: AbortSignal
): esbuild.Plugin => {
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
        const cachedResult = await cacheGet(args.path);
        if (cachedResult) {
          return cachedResult;
        }
      });

      build.onLoad({ filter: /\.css$/ }, async (args: esbuild.OnLoadArgs) => {
        const { data, request } = await get(args.path, signal);
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
        await cacheSet(args.path, result);
        return result;
      });

      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        const { data, request } = await get(args.path, signal, "text");
        const result: esbuild.OnLoadResult = {
          loader: loaderFor(args.path),
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname,
        };
        await cacheSet(args.path, result);
        return result;
      });
    },
  };
};

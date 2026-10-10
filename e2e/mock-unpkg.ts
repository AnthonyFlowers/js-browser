import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";

const FIXTURES = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures/unpkg"
);
const FINAL_URL_HEADER = "x-final-url";
const CORS = { "access-control-allow-origin": "*" };

export interface MockUnpkgOptions {
  /** Package names whose requests never get an answer (simulates a stalled connection). */
  stall?: string[];
  /** Package names whose responses are delayed by `delayMs`. */
  slow?: string[];
  delayMs?: number;
  /** Caps the XHR timeout the app asks for so timeout paths finish quickly in tests. */
  requestTimeoutMs?: number;
}

export interface UnpkgMock {
  /** Path of every request that reached unpkg.com, in order. */
  requests: string[];
}

const fixturePackages = () => {
  const versions = new Map<string, string>();
  for (const dir of readdirSync(FIXTURES)) {
    const at = dir.lastIndexOf("@");
    versions.set(dir.slice(0, at), dir.slice(at + 1));
  }
  return versions;
};

const contentTypeOf = (file: string) =>
  file.endsWith(".css") ? "text/css" : "text/javascript";

const findFile = (dir: string, path: string) =>
  [path, `${path}.js`, `${path}/index.js`].find(
    (candidate) =>
      existsSync(join(dir, candidate)) &&
      statSync(join(dir, candidate)).isFile()
  );

/**
 * Serves unpkg.com from the packages in e2e/fixtures/unpkg. Like the real service, an
 * unversioned URL resolves to the concrete `name@version/file`, which the app reads from
 * `responseURL`. Unknown packages answer 404.
 */
export const mockUnpkg = async (
  page: Page,
  options: MockUnpkgOptions = {}
): Promise<UnpkgMock> => {
  const versions = fixturePackages();
  const mock: UnpkgMock = { requests: [] };

  await page.addInitScript((header) => {
    const descriptor = Object.getOwnPropertyDescriptor(
      XMLHttpRequest.prototype,
      "responseURL"
    )!;
    Object.defineProperty(XMLHttpRequest.prototype, "responseURL", {
      ...descriptor,
      get() {
        return this.getResponseHeader(header) || descriptor.get!.call(this);
      },
    });
  }, FINAL_URL_HEADER);

  if (options.requestTimeoutMs !== undefined) {
    await page.addInitScript((timeoutMs) => {
      const descriptor = Object.getOwnPropertyDescriptor(
        XMLHttpRequest.prototype,
        "timeout"
      )!;
      Object.defineProperty(XMLHttpRequest.prototype, "timeout", {
        ...descriptor,
        set(value: number) {
          descriptor.set!.call(this, Math.min(value, timeoutMs));
        },
      });
    }, options.requestTimeoutMs);
  }

  await page.route("https://unpkg.com/**", async (route) => {
    const { pathname } = new URL(route.request().url());
    mock.requests.push(pathname);
    const match = pathname.match(
      /^\/((?:@[^/]+\/)?[^@/]+)(?:@([^/]+))?(\/.*)?$/
    );
    if (!match) return route.fulfill({ status: 404, headers: CORS });
    const [, name, requestedVersion, rest = ""] = match;

    if (options.stall?.includes(name)) return;
    if (options.slow?.includes(name)) {
      await new Promise((resolve) =>
        setTimeout(resolve, options.delayMs ?? 1000)
      );
    }

    const version = versions.get(name);
    if (!version || (requestedVersion && requestedVersion !== version)) {
      return route.fulfill({ status: 404, headers: CORS });
    }
    const dir = join(FIXTURES, `${name}@${version}`);
    const entry = rest
      ? findFile(dir, rest.slice(1))
      : (JSON.parse(readFileSync(join(dir, "package.json"), "utf8"))
          .main as string);
    if (!entry || !existsSync(join(dir, entry))) {
      return route.fulfill({ status: 404, headers: CORS });
    }

    // Playwright cannot route the hop after a fulfilled 302, so a redirect is served in one step and
    // the init script below makes XMLHttpRequest.responseURL report the final URL, as unpkg would.
    return route.fulfill({
      headers: {
        ...CORS,
        "access-control-expose-headers": FINAL_URL_HEADER,
        [FINAL_URL_HEADER]: `https://unpkg.com/${name}@${version}/${entry}`,
      },
      contentType: contentTypeOf(entry),
      body: readFileSync(join(dir, entry)),
    });
  });

  return mock;
};

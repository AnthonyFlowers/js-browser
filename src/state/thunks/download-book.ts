import { isTouchDevice } from "../../platform";

const downloadWithAnchor = (filename: string, contents: string) => {
  const url = URL.createObjectURL(
    new Blob([contents], { type: "application/json" })
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

/**
 * Desktop streams the file through streamsaver. Its service worker and MITM page are unreliable
 * on iOS Safari and touch browsers, so there a Blob and a temporary `<a download>` is used.
 */
export const downloadBook = async (filename: string, contents: string) => {
  if (isTouchDevice() || !("serviceWorker" in navigator)) {
    downloadWithAnchor(filename, contents);
    return;
  }
  try {
    const { createWriteStream } = await import("streamsaver");
    const fileStream = createWriteStream(filename);
    await new Response(contents).body?.pipeTo(fileStream);
  } catch {
    downloadWithAnchor(filename, contents);
  }
};

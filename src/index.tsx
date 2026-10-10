import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const RELOAD_FLAG = "preload-error-reloaded";

// A stale tab after a deploy requests chunk names that no longer exist; reload once to pick up the new build.
window.addEventListener("vite:preloadError", () => {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) {
      return;
    }
    sessionStorage.setItem(RELOAD_FLAG, "1");
  } catch {
    return;
  }
  window.location.reload();
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

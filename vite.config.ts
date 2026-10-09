import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/js-browser/",
  plugins: [react()],
  define: {
    // Some browser-side libs (jscodeshift, monaco-jsx-highlighter, streamsaver) expect Node's `global`.
    global: "globalThis",
  },
});

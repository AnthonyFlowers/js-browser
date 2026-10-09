import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/js-browser/",
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  define: {
    // Some browser-side libs (jscodeshift, monaco-jsx-highlighter, streamsaver) expect Node's `global`.
    global: "globalThis",
  },
});

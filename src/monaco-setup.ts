import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { shikiToMonaco } from "@shikijs/monaco";
import EditorWorker from "monaco-editor/editor/editor.worker?worker";
import TsWorker from "monaco-editor/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
  getWorker: (_workerId, label) =>
    label === "typescript" || label === "javascript"
      ? new TsWorker()
      : new EditorWorker(),
};

loader.config({ monaco });

export const EDITOR_THEME = "dark-plus";

const highlighter = await createHighlighterCore({
  themes: [import("shiki/themes/dark-plus.mjs")],
  langs: [import("shiki/langs/javascript.mjs")],
  engine: createJavaScriptRegexEngine(),
});
shikiToMonaco(highlighter, monaco);

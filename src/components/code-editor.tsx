import MonacoEditor, { OnMount } from "@monaco-editor/react";
import { useRef } from "react";
import { format } from "prettier/standalone";
import * as babel from "prettier/plugins/babel";
import * as estree from "prettier/plugins/estree";
import { EDITOR_THEME } from "../monaco-setup";
import "./code-editor.css";

interface CodeEditorProps {
  initialValue: string;
  onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange }) => {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const onEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      onChange(editor.getValue());
    });
    editor.getModel()?.updateOptions({ tabSize: 2 });
  };

  async function onFormatClick() {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    const formatted = await format(editor.getValue(), {
      parser: "babel",
      plugins: [babel, estree],
      useTabs: false,
      semi: true,
      singleQuote: true,
    });
    editor.setValue(formatted.replace(/\n$/, ""));
  }

  return (
    <div className="editor-wrapper">
      <button
        className="button buton-format is-primary is-small button-format"
        onClick={onFormatClick}
      >
        Format
      </button>
      <MonacoEditor
        onMount={onEditorMount}
        value={initialValue}
        height="100%"
        language="javascript"
        theme={EDITOR_THEME}
        options={{
          wordWrap: "on",
          minimap: { enabled: false },
          showUnused: false,
          folding: false,
          lineNumbersMinChars: 3,
          fontSize: 18,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          scrollbar: { alwaysConsumeMouseWheel: false },
        }}
      />
    </div>
  );
};

export default CodeEditor;

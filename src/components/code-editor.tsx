import MonacoEditor, { OnMount } from "@monaco-editor/react";
import { useRef, useState } from "react";
import { EDITOR_THEME } from "../monaco-setup";
import "./code-editor.css";

interface CodeEditorProps {
  initialValue: string;
  onChange(value: string): void;
}

const describeFormatError = (err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  const isSyntaxError = err instanceof Error && "loc" in err;
  const firstLine = message.split("\n")[0];
  return isSyntaxError
    ? `Can't format: ${firstLine}`
    : "Format failed: could not load the formatter. Check your connection and try again.";
};

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange }) => {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const [formatError, setFormatError] = useState<string | null>(null);

  const onEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      setFormatError(null);
      onChange(editor.getValue());
    });
    editor.getModel()?.updateOptions({ tabSize: 2 });
  };

  async function onFormatClick() {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    setFormatError(null);
    try {
      const [{ format }, babel, estree] = await Promise.all([
        import("prettier/standalone"),
        import("prettier/plugins/babel"),
        import("prettier/plugins/estree"),
      ]);
      const formatted = await format(editor.getValue(), {
        parser: "babel",
        plugins: [babel, estree],
        useTabs: false,
        semi: true,
        singleQuote: true,
      });
      editor.setValue(formatted.replace(/\n$/, ""));
    } catch (err) {
      setFormatError(describeFormatError(err));
    }
  }

  return (
    <div className="editor-wrapper">
      <button
        className="button buton-format is-primary is-small button-format"
        onClick={onFormatClick}
      >
        Format
      </button>
      {formatError && (
        <div
          className="format-error notification is-danger is-light"
          role="alert"
        >
          {formatError}
        </div>
      )}
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

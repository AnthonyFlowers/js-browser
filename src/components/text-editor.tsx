import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../hooks/use-app-dispatch";
import { NARROW_QUERY, useMediaQuery } from "../hooks/use-media-query";
import { Cell, updateCell } from "../state";
import "./text-editor.css";

interface TextEditorProps {
  cell: Cell;
}

const TextEditor: React.FC<TextEditorProps> = ({ cell }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [editing, setEditing] = useState(false);
  const narrow = useMediaQuery(NARROW_QUERY);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const leaveIfOutside = (event: Event) => {
      if (
        ref.current &&
        event.target &&
        ref.current.contains(event.target as Node)
      ) {
        return;
      }
      setEditing(false);
    };
    // iOS Safari does not fire click on taps of non-interactive elements, so a
    // touch counts when it lifts (a scroll gesture cancels the pointer instead).
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        leaveIfOutside(event);
      }
    };
    document.addEventListener("click", leaveIfOutside, { capture: true });
    document.addEventListener("pointerup", onPointerUp, { capture: true });
    return () => {
      document.removeEventListener("click", leaveIfOutside, { capture: true });
      document.removeEventListener("pointerup", onPointerUp, {
        capture: true,
      });
    };
  }, []);

  if (editing) {
    return (
      <div className="text-editor" ref={ref} data-color-mode="dark">
        <MDEditor
          value={cell.content}
          preview={narrow ? "edit" : "live"}
          onChange={(v) =>
            dispatch(updateCell({ id: cell.id, content: v || "" }))
          }
        />
      </div>
    );
  }
  return (
    <div
      className="text-editor card"
      data-color-mode="dark"
      onClick={() => {
        setEditing(true);
      }}
    >
      <div className="card-content">
        <MDEditor.Markdown source={cell.content || "Click to edit"} />
      </div>
    </div>
  );
};

export default TextEditor;

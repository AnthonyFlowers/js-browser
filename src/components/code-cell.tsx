import "./code-cell.css";
import { lazy, Suspense, useEffect } from "react";
import { Cell, createBundle, updateCell } from "../state";
import Preview from "./preview";
import Resizable from "./resizable";
import ErrorBoundary from "./error-boundary";
import { useAppDispatch } from "../hooks/use-app-dispatch";
import { useAppSelector } from "../hooks/use-app-selector";
import { useCumulativeCode } from "../hooks/use-cumulative-code";
import { NARROW_QUERY, useMediaQuery } from "../hooks/use-media-query";

const CodeEditor = lazy(() => import("./code-editor"));

interface CodeCellProps {
  cell: Cell;
}

const CodeCell: React.FC<CodeCellProps> = ({ cell }) => {
  const dispatch = useAppDispatch();
  const bundle = useAppSelector((state) => state.bundles[cell.id]);
  const cumulativeCode = useCumulativeCode(cell.id);

  useEffect(() => {
    if (!bundle) {
      dispatch(createBundle({ cellId: cell.id, input: cumulativeCode }));
      return;
    }
    const timer = setTimeout(async () => {
      dispatch(createBundle({ cellId: cell.id, input: cumulativeCode }));
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cell.id, cumulativeCode, dispatch]);

  const narrow = useMediaQuery(NARROW_QUERY);

  const editor = (
    <ErrorBoundary message="The code editor failed to load.">
      <Suspense fallback={null}>
        <CodeEditor
          initialValue={cell.content}
          onChange={(value) =>
            dispatch(updateCell({ id: cell.id, content: value }))
          }
        />
      </Suspense>
    </ErrorBoundary>
  );

  const preview = (
    <div className="progress-wrapper">
      {!bundle || bundle.loading ? (
        <div className="progress-cover">
          <progress className="progress is-small is-primary" max={100}>
            Loading...
          </progress>
        </div>
      ) : (
        <Preview code={bundle.code} bundlingStatus={bundle.err} />
      )}
    </div>
  );

  if (narrow) {
    return (
      <div className="code-cell-stacked">
        <Resizable direction="vertical" minHeight={120}>
          <div className="stacked-editor">{editor}</div>
        </Resizable>
        {preview}
      </div>
    );
  }

  return (
    <Resizable direction="vertical">
      <div
        style={{
          height: "calc(100% - 10px)",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Resizable direction="horizontal">{editor}</Resizable>
        {preview}
      </div>
    </Resizable>
  );
};

export default CodeCell;

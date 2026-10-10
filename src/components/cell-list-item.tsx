import "./cell-list-item.css";
import { lazy, Suspense } from "react";
import { Cell } from "../state";
import CodeCell from "./code-cell";
import ActionBar from "./action-bar";
import ErrorBoundary from "./error-boundary";

// The markdown stack (react-md-editor, refractor, micromark) is only fetched once a text cell exists.
const TextEditor = lazy(() => import("./text-editor"));

interface CellListItemProps {
  cell: Cell;
}

const CellListItem: React.FC<CellListItemProps> = ({ cell }) => {
  let child: React.JSX.Element;
  if (cell.type === "code") {
    child = (
      <>
        <div className="action-bar-wrapper">
          <ActionBar id={cell.id} />
        </div>
        <CodeCell cell={cell} />
      </>
    );
  } else {
    child = (
      <>
        <ErrorBoundary message="The text editor failed to load.">
          <Suspense
            fallback={
              <div className="text-editor card">
                <div className="card-content" aria-busy="true" />
              </div>
            }
          >
            <TextEditor cell={cell} />
          </Suspense>
        </ErrorBoundary>
        <ActionBar id={cell.id} />
      </>
    );
  }
  return <div className="cell-list-item">{child}</div>;
};

export default CellListItem;

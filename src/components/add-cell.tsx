import { useAppDispatch } from "../hooks/use-app-dispatch";
import { insertCellAfter } from "../state";
import "./add-cell.css";

interface AddCellProps {
  previousCellId: string | null;
  forceVisible?: boolean;
}

const AddCell: React.FC<AddCellProps> = ({ previousCellId, forceVisible }) => {
  const dispatch = useAppDispatch();

  return (
    <div className={`add-cell${forceVisible ? " force-visible" : ""}`}>
      <div className="add-buttons">
        <button
          className="button is-rounded is-primary is-small"
          onClick={() =>
            dispatch(insertCellAfter({ id: previousCellId, type: "code" }))
          }
        >
          <span className="icon is-small">
            <i className="fas fa-plus"></i>
          </span>
          <span>Code</span>
        </button>
        <button
          className="button is-rounded is-primary is-small"
          onClick={() =>
            dispatch(insertCellAfter({ id: previousCellId, type: "text" }))
          }
        >
          <span className="icon is-small">
            <i className="fas fa-plus"></i>
          </span>
          <span>Text</span>
        </button>
      </div>
      <div className="divider"></div>
    </div>
  );
};

export default AddCell;

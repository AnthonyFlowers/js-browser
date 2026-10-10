import "./action-bar.css";
import { useAppDispatch } from "../hooks/use-app-dispatch";
import { deleteCell, moveCell } from "../state";
import { ActionButton } from "./action-button";

interface ActionBarProps {
  id: string;
}

const ActionBar: React.FC<ActionBarProps> = ({ id }) => {
  const dispatch = useAppDispatch();

  return (
    <div className="action-bar">
      <ActionButton
        action={() => dispatch(moveCell({ id, direction: "up" }))}
        icon="fa-arrow-up"
      />
      <ActionButton
        action={() => dispatch(moveCell({ id, direction: "down" }))}
        icon="fa-arrow-down"
      />
      <ActionButton action={() => dispatch(deleteCell(id))} icon="fa-times" />
    </div>
  );
};

export default ActionBar;

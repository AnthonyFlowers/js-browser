import "./cell-list.css";
import { useTypedSelector } from "../hooks/use-typed-selector";
import CellListItem from "./cell-list-item";
import AddCell from "./add-cell";
import { Fragment, useEffect, useMemo } from "react";
import { useActions } from "../hooks/use-actions";

const CellList: React.FC = () => {
  const order = useTypedSelector((state) => state.cells.order);
  const data = useTypedSelector((state) => state.cells.data);
  const cells = useMemo(() => order.map((id) => data[id]), [order, data]);
  const { fetchCells } = useActions();

  useEffect(() => {
    fetchCells("default");
  }, [fetchCells]);

  const renderedCells = cells.map((cell) => (
    <Fragment key={cell.id}>
      <CellListItem cell={cell} />
      <AddCell previousCellId={cell.id} />
    </Fragment>
  ));

  return (
    <div className="cell-list">
      <AddCell forceVisible={cells.length === 0} previousCellId={null} />
      {renderedCells}
    </div>
  );
};

export default CellList;

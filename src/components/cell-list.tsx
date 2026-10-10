import "./cell-list.css";
import { useAppSelector } from "../hooks/use-app-selector";
import { useAppDispatch } from "../hooks/use-app-dispatch";
import { fetchCells } from "../state";
import CellListItem from "./cell-list-item";
import AddCell from "./add-cell";
import { Fragment, useEffect, useMemo } from "react";

const CellList: React.FC = () => {
  const order = useAppSelector((state) => state.cells.order);
  const data = useAppSelector((state) => state.cells.data);
  const cells = useMemo(() => order.map((id) => data[id]), [order, data]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCells("default"));
  }, [dispatch]);

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

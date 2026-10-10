import { ChangeEvent, useEffect, useState } from "react";
import { useAppDispatch } from "../hooks/use-app-dispatch";
import { useAppSelector } from "../hooks/use-app-selector";
import { exportCells, updateTitle } from "../state";
import BookImporter from "./book-importer";
import "./top-menu.css";

export const TopMenu = () => {
  const dispatch = useAppDispatch();
  const initialTitle = useAppSelector(({ cells: { title } }) => {
    return title;
  });
  const [title, setTitle] = useState<string>(initialTitle);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const handleExport = () => {
    dispatch(exportCells());
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      dispatch(updateTitle(title));
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [title, dispatch]);

  const handleTitleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setTitle(evt.target.value);
  };

  return (
    <div className="top-menu">
      <h1>Book Title:</h1>
      <span className="control">
        <input
          className="input is-rounded"
          type="text"
          value={title}
          onChange={handleTitleChange}
          disabled
        />
      </span>
      <button
        className="button is-rounded is-primary is-small"
        onClick={handleExport}
      >
        Save Book
      </button>
      <button
        className="button is-rounded is-primary is-small"
        onClick={setIsImporting.bind(null, !isImporting)}
      >
        Load Book
      </button>
      {isImporting ? <BookImporter /> : ""}
    </div>
  );
};

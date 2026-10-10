import { useState } from "react";
import { useAppDispatch } from "../hooks/use-app-dispatch";
import { importCells } from "../state";
import { isTouchDevice } from "../platform";
import "./book-importer.css";

const BookImporter = () => {
  const [fileName, setFileName] = useState("none");
  const dispatch = useAppDispatch();
  const handleFileChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    let nextFileName = "none";
    const file = evt.target.files?.[0];
    if (file) {
      nextFileName = file.name;
      fileReader.readAsText(file);
    }
    setFileName(nextFileName);
  };

  const fileReader = new FileReader();
  fileReader.onloadend = () => {
    const readFile = fileReader.result;
    if (readFile && typeof readFile === "string") {
      dispatch(importCells(readFile));
    }
  };

  return (
    <label className="file-label">
      <input
        className="file-input"
        onChange={handleFileChange}
        type="file"
        accept={isTouchDevice() ? undefined : ".book"}
        name="resume"
      />
      <span className="file-cta">
        <span className="file-icon">
          <i className="fa fa-upload"></i>
        </span>
        <span className="file-label">Pick Book</span>
      </span>
      <span className="file-name">{fileName}</span>
    </label>
  );
};

export default BookImporter;

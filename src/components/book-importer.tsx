import { useState } from "react";
import { useActions } from "../hooks/use-actions";
import "./book-importer.css";

const BookImporter = () => {
  const [fileName, setFileName] = useState("none");
  const { importCells } = useActions();
  const handleFileChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    let nextFileName = "none";
    if (evt.target.files) {
      nextFileName = evt.target.files[0].name;
      fileReader.readAsText(evt.target.files[0]);
    }
    setFileName(nextFileName);
  };

  const fileReader = new FileReader();
  fileReader.onloadend = () => {
    const readFile = fileReader.result;
    if (readFile && typeof readFile === "string") {
      importCells(readFile);
    }
  };

  return (
    <label className="file-label">
      <input
        className="file-input"
        onChange={handleFileChange}
        type="file"
        accept=".book"
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

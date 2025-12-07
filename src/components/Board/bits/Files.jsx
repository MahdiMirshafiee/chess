import { getCharecter } from "../../../helper/helper";
import "./Files.css";

function Files({ files,theme }) {
  return (
    <div className={theme === "dark" ? "files-dark": "files"} key={files}>
      {files.map((file) => (
        <span key={file}>{getCharecter(file)}</span>
      ))}
    </div>
  );
}

export default Files;

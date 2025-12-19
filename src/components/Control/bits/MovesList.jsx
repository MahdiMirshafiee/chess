import { useAppContext } from "../../../contexts/Context";
import "./MovesList.css";

function MovesList({ theme }) {
  const {
    appState: { movesList },
  } = useAppContext();

  return (
    <div className={theme === "dark" ? "moves-list dark" : "moves-list light"}>
      {movesList.map((move, i) => (
        <div key={i} data-number={Math.floor(i / 2) + 1}>
          {move}
        </div>
      ))}
    </div>
  );
}

export default MovesList;

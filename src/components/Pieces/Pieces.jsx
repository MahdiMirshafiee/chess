import { useRef } from "react";
import Piece from "./Piece";
import "./Pieces.css";
import { copyPosition } from "../../helper/helper";
import { useAppContext } from "../../contexts/Context";
import { clearCandidates, makeNewMove } from "../../reducer/actions/move";
import arbiter from "../../arbiter/arbiter";

function Pieces() {
  const ref = useRef();
  const { appState, dispatch } = useAppContext();
  const currentPosition = appState.position[appState.position.length - 1];

  const calculateCoords = (clientX, clientY) => {
    const { width, left, top } = ref.current.getBoundingClientRect();
    const size = width / 8;
    const y = Math.floor((clientX - left) / size);
    const x = 7 - Math.floor((clientY - top) / size);
    return { x, y };
  };

  const move = (e) => {
    const { x, y } = calculateCoords(e.clientX, e.clientY);
    const [piece, rank, file] = e.dataTransfer.getData("text").split(",");
    if (appState.candidateMoves?.find((m) => m[0] === x && m[1] === y)) {
      const newPosition = arbiter.performMove({
        position: currentPosition,
        piece,
        rank,
        file,
        x,
        y,
      });
      dispatch(makeNewMove({ newPosition }));
    }
    dispatch(clearCandidates());
  };

  const onDrop = (e) => {
    e.preventDefault();
    move(e);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onTouchDrop = (clientX, clientY, piece, rank, file) => {
    const newPosition = copyPosition(currentPosition);
    const { x, y } = calculateCoords(clientX, clientY);
    if (appState.candidateMoves?.find((m) => m[0] === x && m[1] === y)) {
      newPosition[rank][file] = "";
      newPosition[x][y] = piece;
      dispatch(makeNewMove({ newPosition }));
    }
    dispatch(clearCandidates());
  };

  return (
    <div ref={ref} onDrop={onDrop} onDragOver={onDragOver} className="pieces">
      {currentPosition.map((r, rank) =>
        r.map((f, file) =>
          currentPosition[rank][file] ? (
            <Piece
              key={rank + "-" + file}
              rank={rank}
              file={file}
              piece={currentPosition[rank][file]}
              onTouchDrop={onTouchDrop}
            />
          ) : null
        )
      )}
    </div>
  );
}

export default Pieces;

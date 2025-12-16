import { useRef } from "react";
import arbiter from "../../arbiter/arbiter";
import { useAppContext } from "../../contexts/Context";
import { generateCandidateMoves } from "../../reducer/actions/move";

function Piece({ rank, file, piece, onTouchDrop }) {
  const { appState, dispatch } = useAppContext();
  const { turn, position } = appState;
  const currentPosition = position[position.length - 1];
  const prevPosition = position[position.length - 2];
  const pieceRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  const generateMoves = () => {
    if (turn === piece[0]) {
      const candidateMoves = arbiter.getValidMoves({
        position: currentPosition,
        prevPosition: prevPosition,
        piece,
        rank,
        file,
      });
      dispatch(generateCandidateMoves({ candidateMoves }));
    }
  };

  const onDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${piece},${rank},${file}`);
    setTimeout(() => {
      e.target.style.display = "none";
    }, 0);
    generateMoves();
  };

  const onDragEnd = (e) => {
    e.target.style.display = "block";
  };

  const onTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    const el = pieceRef.current;
    el.style.position = "fixed";
    el.style.zIndex = "100";
    el.style.width = `${el.offsetWidth}px`;
    el.style.height = `${el.offsetHeight}px`;
    el.style.left = `${touch.clientX - el.offsetWidth / 2}px`;
    el.style.top = `${touch.clientY - el.offsetHeight / 2}px`;
    el.style.transform = "none";

    generateMoves();
  };

  const onTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const el = pieceRef.current;
    el.style.left = `${touch.clientX - el.offsetWidth / 2}px`;
    el.style.top = `${touch.clientY - el.offsetHeight / 2}px`;
  };

  const onTouchEnd = (e) => {
    const el = pieceRef.current;
    const touch = e.changedTouches[0];

    el.style.position = "";
    el.style.zIndex = "";
    el.style.width = "";
    el.style.height = "";
    el.style.left = "";
    el.style.top = "";
    el.style.transform = "";

    onTouchDrop(touch.clientX, touch.clientY, piece, rank, file);
  };

  const onClick = () => {
    generateMoves();
  };

  return (
    <div
      ref={pieceRef}
      className={`piece ${piece} p-${file}${rank}`}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
    />
  );
}

export default Piece;

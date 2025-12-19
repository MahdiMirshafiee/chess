import { useRef } from "react";
import arbiter from "../../arbiter/arbiter";
import { useAppContext } from "../../contexts/Context";
import { generateCandidateMoves, makeNewMove, clearCandidates } from "../../reducer/actions/move";
import { openPromotion } from "../../reducer/actions/popup";

function Piece({ rank, file, piece, onTouchDrop, selectedPiece, setSelectedPiece }) {
  const { appState, dispatch } = useAppContext();
  const { turn, position, castleDirection } = appState;
  const currentPosition = position[position.length - 1];
  const prevPosition = position[position.length - 2];
  const pieceRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  const generateMoves = () => {
    if (turn === piece[0]) {
      const candidateMoves = arbiter.getValidMoves({
        position: currentPosition,
        prevPosition: prevPosition,
        castleDirection: castleDirection[turn],
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
    setSelectedPiece(null);
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

  const onClick = (e) => {
    e.stopPropagation();
    
    if (selectedPiece && appState.candidateMoves?.find((m) => m[0] === rank && m[1] === file)) {
      const selectedPieceData = currentPosition[selectedPiece.rank][selectedPiece.file];
      const selectedRank = selectedPiece.rank;
      const selectedFile = selectedPiece.file;
      
      if ((selectedPieceData === "wp" && rank === 7) || (selectedPieceData === "bp" && rank === 0)) {
        dispatch(openPromotion({ rank: Number(selectedRank), file: Number(selectedFile), x: rank, y: file }));
        setSelectedPiece(null);
        return;
      }
      
      const newPosition = arbiter.performMove({
        position: currentPosition,
        piece: selectedPieceData,
        rank: selectedRank,
        file: selectedFile,
        x: rank,
        y: file,
      });
      
      dispatch(makeNewMove({ newPosition }));
      dispatch(clearCandidates());
      setSelectedPiece(null);
      return;
    }
    
    if (turn === piece[0]) {
      if (selectedPiece && selectedPiece.rank === rank && selectedPiece.file === file) {
        setSelectedPiece(null);
        dispatch(clearCandidates());
      } else {
        setSelectedPiece({ rank, file });
        generateMoves();
      }
    }
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

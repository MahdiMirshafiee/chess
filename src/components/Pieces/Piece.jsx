import { useRef } from "react";
import arbiter from "../../arbiter/arbiter";
import { useAppContext } from "../../contexts/Context";
import {
  generateCandidateMoves,
  makeNewMove,
  clearCandidates,
} from "../../reducer/actions/move";
import { openPromotion } from "../../reducer/actions/popup";
import {
  detectCheckMate,
  detectInSufficientMaterial,
  detectStalemate,
} from "../../reducer/actions/game";
import { getNewMoveNotation } from "../../helper/helper";

function Piece({
  rank,
  file,
  piece,
  onTouchDrop,
  selectedPiece,
  setSelectedPiece,
}) {
  const { appState, dispatch } = useAppContext();
  const { turn, position, castleDirection } = appState;
  const currentPosition = position[position.length - 1];
  const prevPosition = position[position.length - 2];
  const pieceRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const isTouchDrag = useRef(false);
  const touchTimeout = useRef(null);

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

  const startDrag = (touch) => {
    isTouchDrag.current = true;
    const el = pieceRef.current;
    el.style.position = "fixed";
    el.style.zIndex = "100";
    el.style.width = `${el.offsetWidth}px`;
    el.style.height = `${el.offsetHeight}px`;
    el.style.left = `${touch.clientX - el.offsetWidth / 2}px`;
    el.style.top = `${touch.clientY - el.offsetHeight / 2}px`;
    el.style.transform = "none";
    setSelectedPiece(null);
    generateMoves();
  };

  const onTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    isTouchDrag.current = false;

    touchTimeout.current = setTimeout(() => {
      startDrag(touch);
    }, 150);
  };

  const onTouchMove = (e) => {
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);

    if (!isTouchDrag.current && (dx > 25 || dy > 25)) {
      clearTimeout(touchTimeout.current);
      startDrag(touch);
    }

    if (isTouchDrag.current) {
      e.preventDefault();
      const el = pieceRef.current;
      el.style.left = `${touch.clientX - el.offsetWidth / 2}px`;
      el.style.top = `${touch.clientY - el.offsetHeight / 2}px`;
    }
  };

  const handlePieceClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();

    if (
      selectedPiece &&
      appState.candidateMoves?.find((m) => m[0] === rank && m[1] === file)
    ) {
      const selectedPieceData =
        currentPosition[selectedPiece.rank][selectedPiece.file];
      const selectedRank = selectedPiece.rank;
      const selectedFile = selectedPiece.file;

      if (
        (selectedPieceData === "wp" && rank === 7) ||
        (selectedPieceData === "bp" && rank === 0)
      ) {
        dispatch(
          openPromotion({
            rank: Number(selectedRank),
            file: Number(selectedFile),
            x: rank,
            y: file,
          })
        );
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

      const newMove = getNewMoveNotation({
        piece: selectedPieceData,
        rank: selectedRank,
        file: selectedFile,
        x: rank,
        y: file,
        position: currentPosition,
      });

      const opponent = selectedPieceData.startsWith("b") ? "w" : "b";
      const opponentCastleDirection = castleDirection[opponent];

      dispatch(makeNewMove({ newPosition, newMove }));

      if (arbiter.insufficientMatrial(newPosition)) {
        dispatch(detectInSufficientMaterial());
      } else if (
        arbiter.isStalemate({
          position: newPosition,
          player: opponent,
          castleDirection: opponentCastleDirection,
        })
      ) {
        dispatch(detectStalemate());
      } else if (
        arbiter.isCheckMate({
          position: newPosition,
          player: opponent,
          castleDirection: opponentCastleDirection,
        })
      ) {
        dispatch(detectCheckMate(selectedPieceData[0]));
      }

      dispatch(clearCandidates());
      setSelectedPiece(null);
      return;
    }

    if (turn === piece[0]) {
      if (
        selectedPiece &&
        selectedPiece.rank === rank &&
        selectedPiece.file === file
      ) {
        setSelectedPiece(null);
        dispatch(clearCandidates());
      } else {
        setSelectedPiece({ rank, file });
        generateMoves();
      }
    }
  };

  const onTouchEnd = (e) => {
    clearTimeout(touchTimeout.current);
    const el = pieceRef.current;
    const touch = e.changedTouches[0];

    if (isTouchDrag.current) {
      el.style.position = "";
      el.style.zIndex = "";
      el.style.width = "";
      el.style.height = "";
      el.style.left = "";
      el.style.top = "";
      el.style.transform = "";
      onTouchDrop(touch.clientX, touch.clientY, piece, rank, file);
    } else {
      handlePieceClick(e);
    }
    isTouchDrag.current = false;
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
      onClick={handlePieceClick}
    />
  );
}

export default Piece;

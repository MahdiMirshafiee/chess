import { useEffect, useRef, useState } from "react";
import Pieces from "../Pieces/Pieces";
import Files from "./bits/Files";
import Ranks from "./bits/Ranks";
import "./Board.css";
import musicFile from "../../assets/Chess-music.mp3";
import { useAppContext } from "../../contexts/Context";
import Popup from "../popup/Popup";
import arbiter from "../../arbiter/arbiter";
import { getKingPosition } from "../../arbiter/getMoves";
import PromotionBox from "../popup/PromotionBox copy/PromotionBox";
import GameEnds from "../popup/GameEnds/GameEnds";
import { Status } from "../../constant";
import { makeNewMove, clearCandidates } from "../../reducer/actions/move";
import { openPromotion } from "../../reducer/actions/popup";
import {
  detectCheckMate,
  detectInSufficientMaterial,
  detectStalemate,
} from "../../reducer/actions/game";
import { getNewMoveNotation } from "../../helper/helper";

function Board({theme,setTheme}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const { appState, dispatch } = useAppContext();
  const position = appState.position[appState.position.length - 1];

  const isChecked = (() => {
    const isInCheck = arbiter.isPlayerInCheck({
      positionAfterMove: position,
      player: appState.turn,
    });
    if (isInCheck) return getKingPosition(position, appState.turn);

    return null;
  })();

  const isMate =
    appState.status === Status.white || appState.status === Status.black
      ? getKingPosition(position, appState.status === Status.white ? "b" : "w")
      : null;

  useEffect(() => {
    document.cookie.split("=")[1] === theme
      ? null
      : (document.cookie = `theme=${theme};`);
  }, [theme]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch((err) => console.warn("play() failed:", err));
      setPlaying(true);
    }
  };

  const ranks = Array(8)
    .fill()
    .map((x, i) => 8 - i);
  const files = Array(8)
    .fill()
    .map((x, i) => i + 1);

  const getClassName = (i, j) => {
    let c = "tile";
    theme === "light"
      ? (c += (i + j) % 2 === 0 ? " tile--dark" : " tile--light")
      : (c += (i + j) % 2 === 0 ? " tile--dark-d" : " tile--light-d");
    if (appState.candidateMoves?.find((m) => m[0] === i && m[1] === j)) {
      if (position[i][j]) c += ` attacking`;
      else c += ` highlight`;
    }

    if (isChecked && isChecked[0] === i && isChecked[1] === j) c += " checked";

    if (isMate && isMate[0] === i && isMate[1] === j) c += " mate";

    return c;
  };

  const movePieceByClick = (targetX, targetY) => {
    if (
      selectedPiece &&
      appState.candidateMoves?.find((m) => m[0] === targetX && m[1] === targetY)
    ) {
      const piece = position[selectedPiece.rank][selectedPiece.file];
      const rank = selectedPiece.rank;
      const file = selectedPiece.file;

      if (
        (piece === "wp" && targetX === 7) ||
        (piece === "bp" && targetX === 0)
      ) {
        dispatch(
          openPromotion({
            rank: Number(rank),
            file: Number(file),
            x: targetX,
            y: targetY,
          })
        );
        setSelectedPiece(null);
        return;
      }

      const newPosition = arbiter.performMove({
        position,
        piece,
        rank,
        file,
        x: targetX,
        y: targetY,
      });

      const newMove = getNewMoveNotation({
        piece,
        rank,
        file,
        x: targetX,
        y: targetY,
        position,
      });

      const opponent = piece.startsWith("b") ? "w" : "b";
      const opponentCastleDirection = appState.castleDirection[opponent];

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
        dispatch(detectCheckMate(piece[0]));
      }

      dispatch(clearCandidates());
      setSelectedPiece(null);
    }
  };

  return (
    <>
      <div className="controls">
        <label className="ui-switch">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={() =>
              setTheme((prev) => (prev === "light" ? "dark" : "light"))
            }
          />
          <div className="slider">
            <div className="circle"></div>
          </div>
        </label>

        <div>
          <audio ref={audioRef} src={musicFile} loop />

          <button
            onClick={() => togglePlay()}
            className="music"
            style={{
              background: theme === "dark" ? "#80a1b5" : "#b48764",
            }}
          >
            {playing ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="white"
                viewBox="0 0 24 24"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg
                style={{ paddingLeft: "3px" }}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="white"
                viewBox="0 0 24 24"
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="board">
        <Ranks ranks={ranks} theme={theme} />
        <div className="tiles">
          {ranks.map((rank, i) =>
            files.map((file, j) => (
              <div
                key={file + "" + rank}
                className={getClassName(7 - i, j)}
              ></div>
            ))
          )}
        </div>
        <Pieces
          selectedPiece={selectedPiece}
          setSelectedPiece={setSelectedPiece}
        />
        {selectedPiece && (
          <div className="click-layer">
            {ranks.map((rank, i) =>
              files.map((file, j) => {
                const x = 7 - i;
                const y = j;
                const isCandidate = appState.candidateMoves?.find(
                  (m) => m[0] === x && m[1] === y
                );
                const isEmpty = !position[x][y];
                if (isCandidate && isEmpty) {
                  return (
                    <div
                      key={`click-${file}-${rank}`}
                      className="click-tile"
                      style={{
                        gridColumn: j + 1,
                        gridRow: i + 1,
                      }}
                      onClick={() => movePieceByClick(x, y)}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        movePieceByClick(x, y);
                      }}
                    ></div>
                  );
                }
                return null;
              })
            )}
          </div>
        )}
        <Popup theme={theme}>
          <PromotionBox />
          <GameEnds />
        </Popup>
        <Files files={files} theme={theme} />
      </div>
    </>
  );
}

export default Board;

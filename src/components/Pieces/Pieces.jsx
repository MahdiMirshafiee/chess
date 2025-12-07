import { useState } from "react";
import Piece from "./Piece";
import "./Pieces.css";
import { createPosition } from "../../helper/helper";

function Pieces() {
  const [position, setPosition] = useState(createPosition());

  return (
    <div className="pieces">
      {position.map((r, rank) =>
        r.map((f, file) =>
          position[rank][file] ? (
            <Piece
              key={rank + "-" + file}
              rank={rank}
              file={file}
              piece={position[rank][file]}
            />
          ) : null
        )
      )}
    </div>
  );
}

export default Pieces;

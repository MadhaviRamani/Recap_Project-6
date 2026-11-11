import type { ReactNode } from "react";

import type { ArtPiece, ArtPieceInfo } from "../types";
import { isFavorite } from "../utils/artPiecesInfo";
import { splitIntoWalls } from "../utils/splitIntoWalls";
import ArtPiecePreview from "./ArtPiecePreview";
import "./Hallway.css";

type HallwayProps = {
  artPieces: ArtPiece[];
  artPiecesInfo: ArtPieceInfo[];
  onToggleFavorite: (slug: string) => void;
};

type WallProps = HallwayProps & {
  side: "left" | "right" | "front";
  label: string;
};

// one wall of the hallway; every art piece hangs under its own lamp and
// grows on its wall when the user points at it (or reaches it with the
// keyboard), its neighbours move aside; a click opens its details page
function Wall({
  side,
  label,
  artPieces,
  artPiecesInfo,
  onToggleFavorite,
}: WallProps) {
  return (
    <div className={`hallway-wall hallway-wall-${side}`}>
      {artPieces.length > 0 && (
        <ul className="hallway-wall-list" aria-label={label}>
          {artPieces.map((artPiece) => (
            <li key={artPiece.slug} className="hallway-item">
              {/* the royal lamp and its light are only decoration */}
              <span className="hallway-lamp" aria-hidden="true" />
              <span className="hallway-light" aria-hidden="true" />
              <ArtPiecePreview
                artPiece={artPiece}
                isFavorite={isFavorite(artPiecesInfo, artPiece.slug)}
                onToggleFavorite={onToggleFavorite}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// the gallery as a 3D hallway: 5 art pieces on the left wall,
// 5 on the right wall and the rest on the front wall
export default function Hallway({
  artPieces,
  artPiecesInfo,
  onToggleFavorite,
  runway,
}: HallwayProps & {
  // shown flat on the near end of the runway, e.g. the search status
  runway?: ReactNode;
}) {
  const walls = splitIntoWalls(artPieces);
  const wallProps = { artPiecesInfo, onToggleFavorite };

  return (
    <div className="hallway">
      {/* outside the 3D room, so it stays flat and readable; first in the
          page, so the keyboard reaches it before the art pieces */}
      {runway && <div className="hallway-runway">{runway}</div>}
      <div className="hallway-room">
        <div className="hallway-ceiling" aria-hidden="true" />
        <div className="hallway-floor" aria-hidden="true" />
        <Wall
          side="left"
          label="Left wall"
          artPieces={walls.left}
          {...wallProps}
        />
        <Wall
          side="right"
          label="Right wall"
          artPieces={walls.right}
          {...wallProps}
        />
        <Wall
          side="front"
          label="Front wall"
          artPieces={walls.front}
          {...wallProps}
        />
      </div>
    </div>
  );
}

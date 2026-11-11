import type { CSSProperties, ReactNode } from "react";

import type { ArtPiece, ArtPieceInfo } from "../types";
import { isFavorite } from "../utils/artPiecesInfo";
import { splitIntoWalls } from "../utils/splitIntoWalls";
import ArtPiecePreview from "./ArtPiecePreview";
import "./Hallway.css";

type HallwayProps = {
  artPieces: ArtPiece[];
  artPiecesInfo: ArtPieceInfo[];
  onToggleFavorite: (slug: string) => void;
  // when given, only these art pieces fill their frame, all others hang
  // as an empty frame (the favorites hallway); without it, all are shown
  filledSlugs?: string[];
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
  filledSlugs,
}: WallProps) {
  return (
    <div className={`hallway-wall hallway-wall-${side}`}>
      {artPieces.length > 0 && (
        <ul className="hallway-wall-list" aria-label={label}>
          {artPieces.map((artPiece, index) => {
            const isEmpty =
              filledSlugs !== undefined && !filledSlugs.includes(artPiece.slug);
            return (
              <li
                key={artPiece.slug}
                className={`hallway-item${isEmpty ? " hallway-item-empty" : ""}`}
                // the place on the wall, 1 = near the viewer; art pieces
                // further back hang bigger and grow more on hover
                style={{ "--hallway-place": index + 1 } as CSSProperties}
              >
                {/* only this part turns and grows; the list item stays on
                  the wall, so the mouse does not lose it */}
                <div className="hallway-item-art">
                  {/* the royal lamp and its light are only decoration */}
                  <span className="hallway-lamp" aria-hidden="true" />
                  <span className="hallway-light" aria-hidden="true" />
                  {isEmpty ? (
                    // no image, no link and no button, so the keyboard skips it
                    <div
                      className="hallway-empty-frame"
                      role="img"
                      aria-label="Empty frame"
                    />
                  ) : (
                    <ArtPiecePreview
                      artPiece={artPiece}
                      isFavorite={isFavorite(artPiecesInfo, artPiece.slug)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  )}
                </div>
              </li>
            );
          })}
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
  filledSlugs,
  runway,
}: HallwayProps & {
  // shown flat on the near end of the runway, e.g. the search status
  runway?: ReactNode;
}) {
  const walls = splitIntoWalls(artPieces);
  const wallProps = { artPiecesInfo, onToggleFavorite, filledSlugs };

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

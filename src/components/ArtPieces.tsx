import type { ArtPiece, ArtPieceInfo } from "../types";
import { isFavorite } from "../utils/artPiecesInfo";
import ArtPiecePreview from "./ArtPiecePreview";

type ArtPiecesProps = {
  artPieces: ArtPiece[];
  artPiecesInfo: ArtPieceInfo[];
  onToggleFavorite: (slug: string) => void;
};

export default function ArtPieces({
  artPieces,
  artPiecesInfo,
  onToggleFavorite,
}: ArtPiecesProps) {
  return (
    <ul className="art-list">
      {artPieces.map((artPiece) => (
        <li key={artPiece.slug}>
          <ArtPiecePreview
            artPiece={artPiece}
            isFavorite={isFavorite(artPiecesInfo, artPiece.slug)}
            onToggleFavorite={onToggleFavorite}
          />
        </li>
      ))}
    </ul>
  );
}

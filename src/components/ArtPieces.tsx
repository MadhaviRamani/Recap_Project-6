import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

type ArtPiecesProps = {
  artPieces: ArtPiece[];
};

export default function ArtPieces({ artPieces }: ArtPiecesProps) {
  return (
    <ul className="art-list">
      {artPieces.map((artPiece) => (
        <li key={artPiece.slug}>
          <ArtPiecePreview artPiece={artPiece} />
        </li>
      ))}
    </ul>
  );
}

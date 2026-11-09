import { useNavigate, useParams } from "react-router";

import type { ArtPiece, ArtPieceInfo } from "../types";
import { isFavorite } from "../utils/artPiecesInfo";
import FavoriteButton from "./FavoriteButton";

type ArtPieceDetailsProps = {
  artPieces: ArtPiece[];
  artPiecesInfo: ArtPieceInfo[];
  onToggleFavorite: (slug: string) => void;
};

export default function ArtPieceDetails({
  artPieces,
  artPiecesInfo,
  onToggleFavorite,
}: ArtPieceDetailsProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const artPiece = artPieces.find((piece) => piece.slug === slug);

  // goes to the list, not "browser back", so it also works for a link opened directly
  const backButton = (
    <button type="button" onClick={() => navigate("/art-pieces")}>
      Back to gallery
    </button>
  );

  if (!artPiece) {
    return (
      <section className="details">
        <h1>Art piece not found</h1>
        {backButton}
      </section>
    );
  }

  const { name, artist, imageSource, year, genre } = artPiece;

  return (
    <section className="details">
      {backButton}
      <FavoriteButton
        isFavorite={isFavorite(artPiecesInfo, artPiece.slug)}
        onToggleFavorite={() => onToggleFavorite(artPiece.slug)}
      />
      <img src={imageSource} alt={`${name} by ${artist}`} />
      <h1>{name}</h1>
      <dl>
        <dt>Artist</dt>
        <dd>{artist}</dd>
        <dt>Year</dt>
        <dd>{year}</dd>
        <dt>Genre</dt>
        <dd>{genre}</dd>
      </dl>
    </section>
  );
}

import { useState } from "react";

import type { ArtPiece, ArtPieceInfo } from "../types";
import { isFavorite } from "../utils/artPiecesInfo";
import { getRandomArtPiece } from "../utils/getRandomArtPiece";
import FavoriteButton from "./FavoriteButton";

type SpotlightProps = {
  artPieces: ArtPiece[];
  artPiecesInfo: ArtPieceInfo[];
  onToggleFavorite: (slug: string) => void;
};

export default function Spotlight({
  artPieces,
  artPiecesInfo,
  onToggleFavorite,
}: SpotlightProps) {
  // the initializer runs only on the first render, so re-renders keep the same piece
  const [artPiece] = useState(() => getRandomArtPiece(artPieces));

  if (!artPiece) {
    return null;
  }

  const { slug, name, artist, imageSource } = artPiece;

  return (
    <figure className="art-piece spotlight">
      <img src={imageSource} alt={`${name} by ${artist}`} />
      <figcaption>
        <h2>{name}</h2>
        <p>{artist}</p>
      </figcaption>
      <FavoriteButton
        isFavorite={isFavorite(artPiecesInfo, slug)}
        onToggleFavorite={() => onToggleFavorite(slug)}
      />
    </figure>
  );
}

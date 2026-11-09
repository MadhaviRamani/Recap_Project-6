import { Link } from "react-router";

import type { ArtPiece } from "../types";
import FavoriteButton from "./FavoriteButton";

type ArtPiecePreviewProps = {
  artPiece: ArtPiece;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
};

export default function ArtPiecePreview({
  artPiece,
  isFavorite,
  onToggleFavorite,
}: ArtPiecePreviewProps) {
  const { slug, name, artist, imageSource } = artPiece;

  return (
    <figure className="art-piece">
      <Link to={`/art-pieces/${slug}`}>
        <img src={imageSource} alt={`${name} by ${artist}`} />
        <figcaption>
          <h2>{name}</h2>
          <p>{artist}</p>
        </figcaption>
      </Link>
      {/* outside the Link: a button inside a link is not valid HTML */}
      <FavoriteButton
        isFavorite={isFavorite}
        onToggleFavorite={() => onToggleFavorite(slug)}
      />
    </figure>
  );
}

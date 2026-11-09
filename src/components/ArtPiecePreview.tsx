import { Link } from "react-router";

import type { ArtPiece } from "../types";

type ArtPiecePreviewProps = {
  artPiece: ArtPiece;
};

export default function ArtPiecePreview({ artPiece }: ArtPiecePreviewProps) {
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
    </figure>
  );
}

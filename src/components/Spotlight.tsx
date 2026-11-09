import { useState } from "react";

import type { ArtPiece } from "../types";
import { getRandomArtPiece } from "../utils/getRandomArtPiece";

type SpotlightProps = {
  artPieces: ArtPiece[];
};

export default function Spotlight({ artPieces }: SpotlightProps) {
  // the initializer runs only on the first render, so re-renders keep the same piece
  const [artPiece] = useState(() => getRandomArtPiece(artPieces));

  if (!artPiece) {
    return null;
  }

  const { name, artist, imageSource } = artPiece;

  return (
    <figure className="art-piece spotlight">
      <img src={imageSource} alt={`${name} by ${artist}`} />
      <figcaption>
        <p>{artist}</p>
      </figcaption>
    </figure>
  );
}

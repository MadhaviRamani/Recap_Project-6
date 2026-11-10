import { useEffect, useState } from "react";

import type { ArtPiece, ArtPieceInfo } from "../types";
import { isFavorite } from "../utils/artPiecesInfo";
import { getRandomArtPiece } from "../utils/getRandomArtPiece";
import FavoriteButton from "./FavoriteButton";

export const SLIDESHOW_INTERVAL_MS = 3000;

type SpotlightProps = {
  artPieces: ArtPiece[];
  artPiecesInfo: ArtPieceInfo[];
  onToggleFavorite: (slug: string) => void;
};

// picks another art piece than the current one, so every change is visible
function getOtherRandomArtPiece(
  artPieces: ArtPiece[],
  current: ArtPiece | undefined
): ArtPiece | undefined {
  const others = artPieces.filter((piece) => piece.slug !== current?.slug);
  return getRandomArtPiece(others) ?? current;
}

export default function Spotlight({
  artPieces,
  artPiecesInfo,
  onToggleFavorite,
}: SpotlightProps) {
  // the initializer runs only on the first render, so re-renders keep the same piece
  const [artPiece, setArtPiece] = useState(() => getRandomArtPiece(artPieces));
  const [isPlaying, setIsPlaying] = useState(false);

  function showOtherArtPiece() {
    setArtPiece((current) => getOtherRandomArtPiece(artPieces, current));
  }

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const intervalId = setInterval(() => {
      setArtPiece((current) => getOtherRandomArtPiece(artPieces, current));
    }, SLIDESHOW_INTERVAL_MS);
    // clears the timer on pause and on leaving the page, so only one timer runs
    return () => clearInterval(intervalId);
  }, [isPlaying, artPieces]);

  if (!artPiece) {
    return null;
  }

  const { slug, name, artist, imageSource } = artPiece;

  return (
    <>
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
      <div className="spotlight-controls">
        <button type="button" onClick={showOtherArtPiece}>
          {isPlaying ? "Shuffling" : "Shuffle"}
        </button>
        <button
          type="button"
          onClick={() => setIsPlaying((playing) => !playing)}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
    </>
  );
}

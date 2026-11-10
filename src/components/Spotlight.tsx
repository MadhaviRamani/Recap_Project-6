import { useEffect, useState } from "react";

import type { ArtPiece, ArtPieceInfo } from "../types";
import { isFavorite } from "../utils/artPiecesInfo";
import { getRandomArtPiece } from "../utils/getRandomArtPiece";
import FavoriteButton from "./FavoriteButton";

export const SLIDESHOW_INTERVAL_MS = 3000;
export const SHUFFLE_DURATION_MS = 3000;

const CUBE_FACE_COUNT = 6;

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

// fills all six faces of the cube, repeating art pieces when there are fewer
function getCubeFaces(artPieces: ArtPiece[]): ArtPiece[] {
  return Array.from(
    { length: CUBE_FACE_COUNT },
    (_, index) => artPieces[index % artPieces.length]
  );
}

export default function Spotlight({
  artPieces,
  artPiecesInfo,
  onToggleFavorite,
}: SpotlightProps) {
  // the initializer runs only on the first render, so re-renders keep the same piece
  const [artPiece, setArtPiece] = useState(() => getRandomArtPiece(artPieces));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    if (!isShuffling) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setArtPiece((current) => getOtherRandomArtPiece(artPieces, current));
      setIsShuffling(false);
    }, SHUFFLE_DURATION_MS);
    // clears the timer when leaving the page during a spin
    return () => clearTimeout(timeoutId);
  }, [isShuffling, artPieces]);

  // the slideshow waits during a spin, so it does not change the image mid-shuffle
  const isSlideshowRunning = isPlaying && !isShuffling;

  useEffect(() => {
    if (!isSlideshowRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      setArtPiece((current) => getOtherRandomArtPiece(artPieces, current));
    }, SLIDESHOW_INTERVAL_MS);
    // clears the timer on pause and on leaving the page, so only one timer runs
    return () => clearInterval(intervalId);
  }, [isSlideshowRunning, artPieces]);

  if (!artPiece) {
    return null;
  }

  const { slug, name, artist, imageSource } = artPiece;

  return (
    <>
      <figure className="art-piece spotlight">
        {isShuffling ? (
          <div
            className="shuffle-scene"
            role="img"
            aria-label="Shuffling art pieces"
          >
            <div className="shuffle-cube">
              {getCubeFaces(artPieces).map((piece, index) => (
                // the same art piece can be on several faces, so the index is part of the key
                <div
                  className="shuffle-cube-face"
                  key={`${piece.slug}-${index}`}
                >
                  <img src={piece.imageSource} alt="" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <img src={imageSource} alt={`${name} by ${artist}`} />
        )}
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
        {/* disabled during a spin, so a click cannot start a second shuffle timer */}
        <button
          type="button"
          onClick={() => setIsShuffling(true)}
          disabled={isShuffling}
        >
          {isShuffling ? "Shuffling" : "Shuffle"}
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

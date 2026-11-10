import { useEffect, useState } from "react";

import type { ArtPiece, ArtPieceInfo } from "../types";
import { isFavorite } from "../utils/artPiecesInfo";
import { getRandomArtPiece } from "../utils/getRandomArtPiece";
import FavoriteButton from "./FavoriteButton";
import "./Spotlight.css";

export const SLIDESHOW_INTERVAL_MS = 3000;
export const SHUFFLE_DURATION_MS = 3000;

const CUBE_FACE_COUNT = 6;

// the shared look of the control icons; hidden from screen readers,
// the label next to each icon names the button
const ICON_PROPS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

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
    // a dark gallery stage: a spotlight shines from the top onto the art piece
    // in its golden frame and ends in a circle of light with the details
    <div className="spotlight-stage">
      <div className="spotlight-beam" aria-hidden="true" />
      <figure className="spotlight">
        {/* while shuffling, the plain 3D box spins in the light without a frame */}
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
          <div className="spotlight-frame">
            <div className="spotlight-mat">
              <img src={imageSource} alt={`${name} by ${artist}`} />
            </div>
          </div>
        )}
        {/* the favorite button belongs to the framed art piece, not to the spinning box */}
        {!isShuffling && (
          <FavoriteButton
            isFavorite={isFavorite(artPiecesInfo, slug)}
            onToggleFavorite={() => onToggleFavorite(slug)}
          />
        )}
        {/* the circle of light on the floor, behind the details */}
        <div className="spotlight-light-circle" aria-hidden="true" />
        {/* no details during the spin; the new art piece's name and artist
            show after it */}
        {!isShuffling && (
          <figcaption className="spotlight-details">
            <h2>{name}</h2>
            <p>{artist}</p>
          </figcaption>
        )}
      </figure>
      <div className="spotlight-controls">
        {/* disabled during a spin, so a click cannot start a second shuffle timer */}
        {/* round media buttons: an icon in a circle with the label under it;
            the label is the button's name */}
        <button
          type="button"
          className="spotlight-control"
          onClick={() => setIsShuffling(true)}
          disabled={isShuffling}
        >
          <span className="spotlight-control-icon">
            {/* shuffle icon from Lucide (lucide.dev/icons/shuffle) */}
            <svg {...ICON_PROPS}>
              <path d="m18 14 4 4-4 4" />
              <path d="m18 2 4 4-4 4" />
              <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-7.6a4 4 0 0 1 3.3-1.7H22" />
              <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" />
              <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" />
            </svg>
          </span>
          <span className="spotlight-control-label">
            {isShuffling ? "Shuffling" : "Shuffle"}
          </span>
        </button>
        <button
          type="button"
          className="spotlight-control spotlight-control-main"
          onClick={() => setIsPlaying((playing) => !playing)}
        >
          <span className="spotlight-control-icon">
            {/* play and pause icons from Lucide (lucide.dev/icons/play, /pause) */}
            {isPlaying ? (
              <svg {...ICON_PROPS}>
                <rect x="14" y="4" width="4" height="16" rx="1" />
                <rect x="6" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg {...ICON_PROPS}>
                <polygon points="7 4 20 12 7 20 7 4" />
              </svg>
            )}
          </span>
          <span className="spotlight-control-label">
            {isPlaying ? "Pause" : "Play"}
          </span>
        </button>
      </div>
    </div>
  );
}

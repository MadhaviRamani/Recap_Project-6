import { useEffect, useState } from "react";
import { Link } from "react-router";

import type { ArtPiece } from "../types";

export const COPIED_DURATION_MS = 3000;

// colors closer than this (distance of the RGB values, 0–441) count as similar
const SIMILAR_COLOR_DISTANCE = 40;

type ColorPaletteProps = {
  colors: string[];
  artPieces: ArtPiece[];
  // the art piece of this palette, left out of the similar art pieces
  currentSlug: string;
};

function toRgb(hexColor: string): number[] {
  const hex = hexColor.replace("#", "");
  return [0, 2, 4].map((start) =>
    Number.parseInt(hex.slice(start, start + 2), 16)
  );
}

export function isSimilarColor(colorA: string, colorB: string): boolean {
  const rgbA = toRgb(colorA);
  const rgbB = toRgb(colorB);
  const distance = Math.hypot(
    ...rgbA.map((value, index) => value - rgbB[index])
  );
  return distance <= SIMILAR_COLOR_DISTANCE;
}

export default function ColorPalette({
  colors,
  artPieces,
  currentSlug,
}: ColorPaletteProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [similarToColor, setSimilarToColor] = useState<string | null>(null);

  // shows "Copied" for 3 seconds; a new copy or leaving the page clears the timer
  useEffect(() => {
    if (copiedColor === null) {
      return;
    }

    const timeoutId = setTimeout(
      () => setCopiedColor(null),
      COPIED_DURATION_MS
    );
    return () => clearTimeout(timeoutId);
  }, [copiedColor]);

  async function copyColor(color: string) {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
    } catch {
      // without clipboard access the code stays visible to copy by hand
    }
  }

  const similarArtPieces =
    similarToColor === null
      ? []
      : artPieces.filter(
          (piece) =>
            piece.slug !== currentSlug &&
            piece.colors.some((color) => isSimilarColor(color, similarToColor))
        );

  return (
    <section aria-labelledby="palette-heading">
      <h2 id="palette-heading">Color palette</h2>
      <ul className="palette">
        {colors.map((color) => {
          const isCopied = copiedColor === color;
          return (
            // the circle holds both buttons; they appear on hover and keyboard focus
            <li
              key={color}
              className={isCopied ? "palette-swatch copied" : "palette-swatch"}
              style={{ backgroundColor: color }}
            >
              <button
                type="button"
                className="palette-code"
                aria-label={`Copy color ${color}`}
                onClick={() => copyColor(color)}
              >
                <span aria-live="polite">{isCopied ? "Copied" : color}</span>
              </button>
              <button
                type="button"
                className="palette-similar"
                aria-label={`Find art pieces with a color similar to ${color}`}
                aria-pressed={similarToColor === color}
                onClick={() => setSimilarToColor(color)}
              >
                Similar
              </button>
            </li>
          );
        })}
      </ul>
      {similarToColor !== null && (
        <section aria-labelledby="similar-heading">
          <h3 id="similar-heading">
            Art pieces with a color similar to {similarToColor}
          </h3>
          {similarArtPieces.length === 0 ? (
            <p>No art pieces with a similar color</p>
          ) : (
            <ul className="similar-art">
              {similarArtPieces.map(({ slug, name, artist, imageSource }) => (
                <li key={slug}>
                  <Link to={`/art-pieces/${slug}`}>
                    <img src={imageSource} alt={`${name} by ${artist}`} />
                    <span>{name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </section>
  );
}

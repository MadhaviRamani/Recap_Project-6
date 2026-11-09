import type { ArtPiece } from "../types";

// crypto.getRandomValues instead of Math.random: the sonarjs/pseudo-random rule
// and SonarQube Cloud flag Math.random as a security hotspot.
export function getRandomArtPiece(artPieces: ArtPiece[]): ArtPiece | undefined {
  if (artPieces.length === 0) {
    return undefined;
  }

  const [randomValue] = crypto.getRandomValues(new Uint32Array(1));
  const index = randomValue % artPieces.length;
  return artPieces[index];
}

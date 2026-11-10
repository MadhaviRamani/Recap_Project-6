import type { ArtPiece } from "../types";

// the art API has no nationality, so it is looked up by the artist's name
const ARTIST_NATIONALITIES: Record<string, string> = {
  "Vincent van Gogh": "Dutch",
  "Pieter Bruegel the Elder": "Flemish",
  "Georges Seurat": "French",
  "Paul Cézanne": "French",
  "Ogata Kōrin": "Japanese",
  "Katsushika Hokusai": "Japanese",
  "Gustav Klimt": "Austrian",
  "Egon Schiele": "Austrian",
  "Klaus Stille": "German",
};

export function getArtistNationality(artist: string): string | undefined {
  return ARTIST_NATIONALITIES[artist];
}

// every nationality of the given art pieces once, sorted for the dropdown
export function getNationalities(artPieces: ArtPiece[]): string[] {
  const nationalities = new Set<string>();
  for (const { artist } of artPieces) {
    const nationality = getArtistNationality(artist);
    if (nationality) {
      nationalities.add(nationality);
    }
  }
  return [...nationalities].sort((a, b) => a.localeCompare(b));
}

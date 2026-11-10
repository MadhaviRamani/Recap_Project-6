import type { ArtPieceInfo } from "../types";

export const STORAGE_KEY = "art-pieces-info";

// only the own information is stored; the art pieces are always fetched from the API
export function loadArtPiecesInfo(): ArtPieceInfo[] {
  const storedValue = localStorage.getItem(STORAGE_KEY);

  if (storedValue === null) {
    return [];
  }

  try {
    const artPiecesInfo: ArtPieceInfo[] = JSON.parse(storedValue);
    return artPiecesInfo;
  } catch {
    // broken data must not break the app, so it starts without own information
    return [];
  }
}

export function saveArtPiecesInfo(artPiecesInfo: ArtPieceInfo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(artPiecesInfo));
}

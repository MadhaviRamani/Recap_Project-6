import type { ArtPieceInfo } from "../types";

export function isFavorite(artPiecesInfo: ArtPieceInfo[], slug: string) {
  return artPiecesInfo.some((info) => info.slug === slug && info.isFavorite);
}

// returns a new list: flips the entry of the slug, or adds one as favorite
export function toggleFavorite(
  artPiecesInfo: ArtPieceInfo[],
  slug: string
): ArtPieceInfo[] {
  const exists = artPiecesInfo.some((info) => info.slug === slug);

  if (!exists) {
    return [...artPiecesInfo, { slug, isFavorite: true }];
  }

  return artPiecesInfo.map((info) =>
    info.slug === slug ? { ...info, isFavorite: !info.isFavorite } : info
  );
}

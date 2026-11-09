import type { ArtPieceComment, ArtPieceInfo } from "../types";

export function isFavorite(artPiecesInfo: ArtPieceInfo[], slug: string) {
  return artPiecesInfo.some((info) => info.slug === slug && info.isFavorite);
}

export function getComments(
  artPiecesInfo: ArtPieceInfo[],
  slug: string
): ArtPieceComment[] {
  return artPiecesInfo.find((info) => info.slug === slug)?.comments ?? [];
}

// returns a new list: updates the entry of the slug, or adds a new one first
function updateInfo(
  artPiecesInfo: ArtPieceInfo[],
  slug: string,
  update: (info: ArtPieceInfo) => ArtPieceInfo
): ArtPieceInfo[] {
  const exists = artPiecesInfo.some((info) => info.slug === slug);

  if (!exists) {
    return [
      ...artPiecesInfo,
      update({ slug, isFavorite: false, comments: [] }),
    ];
  }

  return artPiecesInfo.map((info) =>
    info.slug === slug ? update(info) : info
  );
}

export function toggleFavorite(
  artPiecesInfo: ArtPieceInfo[],
  slug: string
): ArtPieceInfo[] {
  return updateInfo(artPiecesInfo, slug, (info) => ({
    ...info,
    isFavorite: !info.isFavorite,
  }));
}

export function addComment(
  artPiecesInfo: ArtPieceInfo[],
  slug: string,
  comment: ArtPieceComment
): ArtPieceInfo[] {
  return updateInfo(artPiecesInfo, slug, (info) => ({
    ...info,
    comments: [...info.comments, comment],
  }));
}

export function editComment(
  artPiecesInfo: ArtPieceInfo[],
  slug: string,
  id: string,
  text: string
): ArtPieceInfo[] {
  return updateInfo(artPiecesInfo, slug, (info) => ({
    ...info,
    comments: info.comments.map((comment) =>
      comment.id === id ? { ...comment, text } : comment
    ),
  }));
}

export function deleteComment(
  artPiecesInfo: ArtPieceInfo[],
  slug: string,
  id: string
): ArtPieceInfo[] {
  return updateInfo(artPiecesInfo, slug, (info) => ({
    ...info,
    comments: info.comments.filter((comment) => comment.id !== id),
  }));
}

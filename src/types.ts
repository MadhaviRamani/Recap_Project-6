export type ArtPiece = {
  slug: string;
  artist: string;
  name: string;
  imageSource: string;
  year: string;
  genre: string;
  colors: string[];
};

// the date is stored as an ISO string and only formatted for display
export type ArtPieceComment = {
  id: string;
  text: string;
  date: string;
};

// own information about an art piece, connected to the fetched data via the slug
export type ArtPieceInfo = {
  slug: string;
  isFavorite: boolean;
  comments: ArtPieceComment[];
};

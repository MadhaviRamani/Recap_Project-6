export type ArtPiece = {
  slug: string;
  artist: string;
  name: string;
  imageSource: string;
  year: string;
  genre: string;
};

// own information about an art piece, connected to the fetched data via the slug
export type ArtPieceInfo = {
  slug: string;
  isFavorite: boolean;
};

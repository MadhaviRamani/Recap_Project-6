import type { ArtPiece } from "../types";
import { cleanSearchText } from "./cleanSearchText";

// lowercase without accents and extra spaces, so "VAN GOGH" finds "van gogh",
// "cezanne" finds "Cézanne" and "van  gogh" finds "van gogh"
function normalize(text: string): string {
  return cleanSearchText(text)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

// returns a new array; the fetched art pieces are never changed
// the text matches name, artist and genre; an empty query means "no filter"
export function searchArtPieces(
  artPieces: ArtPiece[],
  query: string
): ArtPiece[] {
  const searchText = normalize(query);

  return artPieces.filter(({ name, artist, genre }) =>
    [name, artist, genre].some((field) => normalize(field).includes(searchText))
  );
}

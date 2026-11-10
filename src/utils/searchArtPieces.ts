import type { ArtPiece } from "../types";
import { getArtistNationality } from "./artistNationality";

// lowercase without accents, so "VAN GOGH" finds "van gogh" and "cezanne" finds "Cézanne"
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

// returns a new array; the fetched art pieces are never changed
// the text matches name, artist and genre; the nationality comes only from the dropdown
// an empty query or nationality means "no filter"
export function searchArtPieces(
  artPieces: ArtPiece[],
  query: string,
  nationality = ""
): ArtPiece[] {
  const searchText = normalize(query.trim());

  return artPieces.filter(({ name, artist, genre }) => {
    if (nationality !== "" && getArtistNationality(artist) !== nationality) {
      return false;
    }

    return [name, artist, genre].some((field) =>
      normalize(field).includes(searchText)
    );
  });
}

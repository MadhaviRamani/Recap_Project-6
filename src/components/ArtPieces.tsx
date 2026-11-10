import { useState } from "react";

import type { ArtPiece, ArtPieceInfo } from "../types";
import { isFavorite } from "../utils/artPiecesInfo";
import { getNationalities } from "../utils/artistNationality";
import { searchArtPieces } from "../utils/searchArtPieces";
import ArtPiecePreview from "./ArtPiecePreview";
import Hallway from "./Hallway";
import SearchBar from "./SearchBar";

type ArtPiecesProps = {
  artPieces: ArtPiece[];
  artPiecesInfo: ArtPieceInfo[];
  onToggleFavorite: (slug: string) => void;
  // only the gallery is searchable; the favorites list uses the same component
  isSearchable?: boolean;
};

export default function ArtPieces({
  artPieces,
  artPiecesInfo,
  onToggleFavorite,
  isSearchable = false,
}: ArtPiecesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // "" stands for all nationalities
  const [nationality, setNationality] = useState("");
  const shownArtPieces = searchArtPieces(artPieces, searchQuery, nationality);
  const isFiltered = searchQuery !== "" || nationality !== "";

  function search(query: string, chosenNationality: string) {
    setSearchQuery(query);
    setNationality(chosenNationality);
  }

  // the gallery hangs in a 3D hallway, with the search on its runway;
  // the hallway stays when nothing matches, so the search bar stays, too
  if (isSearchable) {
    return (
      <Hallway
        artPieces={shownArtPieces}
        artPiecesInfo={artPiecesInfo}
        onToggleFavorite={onToggleFavorite}
        runway={
          <>
            {isFiltered && (
              <p className="search-status">
                Results
                {searchQuery !== "" && <> for &ldquo;{searchQuery}&rdquo;</>}
                {nationality !== "" && <> from {nationality} artists</>}{" "}
                <button type="button" onClick={() => search("", "")}>
                  Show all
                </button>
              </p>
            )}
            {isFiltered && shownArtPieces.length === 0 && (
              <p className="search-status">No art pieces found</p>
            )}
            <SearchBar
              nationalities={getNationalities(artPieces)}
              onSearch={search}
            />
          </>
        }
      />
    );
  }

  // the favorites stay a list; they cannot be searched
  return (
    <ul className="art-list">
      {shownArtPieces.map((artPiece) => (
        <li key={artPiece.slug}>
          <ArtPiecePreview
            artPiece={artPiece}
            isFavorite={isFavorite(artPiecesInfo, artPiece.slug)}
            onToggleFavorite={onToggleFavorite}
          />
        </li>
      ))}
    </ul>
  );
}

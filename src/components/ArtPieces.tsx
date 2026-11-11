import type { ArtPiece, ArtPieceInfo } from "../types";
import { isFavorite } from "../utils/artPiecesInfo";
import { searchArtPieces } from "../utils/searchArtPieces";
import ArtPiecePreview from "./ArtPiecePreview";
import Hallway from "./Hallway";

type ArtPiecesProps = {
  artPieces: ArtPiece[];
  artPiecesInfo: ArtPieceInfo[];
  onToggleFavorite: (slug: string) => void;
  // the gallery hangs in a hallway; the favorites stay a list
  isHallway?: boolean;
  // the search comes from the search bar in the navigation; "" means no filter
  searchQuery?: string;
  nationality?: string;
  onShowAll?: () => void;
};

export default function ArtPieces({
  artPieces,
  artPiecesInfo,
  onToggleFavorite,
  isHallway = false,
  searchQuery = "",
  nationality = "",
  onShowAll,
}: ArtPiecesProps) {
  const shownArtPieces = searchArtPieces(artPieces, searchQuery, nationality);
  const isFiltered = searchQuery !== "" || nationality !== "";

  const searchStatus = isFiltered && (
    <>
      <p className="search-status">
        Results
        {searchQuery !== "" && <> for &ldquo;{searchQuery}&rdquo;</>}
        {nationality !== "" && <> from {nationality} artists</>}{" "}
        <button type="button" onClick={onShowAll}>
          Show all
        </button>
      </p>
      {shownArtPieces.length === 0 && (
        <p className="search-status">No art pieces found</p>
      )}
    </>
  );

  // the gallery hangs in a 3D hallway, with the search status on its runway;
  // the hallway stays when nothing matches
  if (isHallway) {
    return (
      <Hallway
        artPieces={shownArtPieces}
        artPiecesInfo={artPiecesInfo}
        onToggleFavorite={onToggleFavorite}
        runway={searchStatus || undefined}
      />
    );
  }

  // the favorites stay a list, with the search status above it
  return (
    <>
      {searchStatus && <div className="search-status-list">{searchStatus}</div>}
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
    </>
  );
}

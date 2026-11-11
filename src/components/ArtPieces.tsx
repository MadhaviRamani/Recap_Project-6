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
  // the favorites hallway: a frame for every art piece, only the
  // favorites fill theirs, all others stay empty
  isFavoritesHallway?: boolean;
  // the search comes from the search bar in the navigation; "" means no filter
  searchQuery?: string;
};

export default function ArtPieces({
  artPieces,
  artPiecesInfo,
  onToggleFavorite,
  isHallway = false,
  isFavoritesHallway = false,
  searchQuery = "",
}: ArtPiecesProps) {
  const searchedArtPieces = searchArtPieces(artPieces, searchQuery);
  const shownArtPieces = isFavoritesHallway
    ? searchedArtPieces.filter((artPiece) =>
        isFavorite(artPiecesInfo, artPiece.slug)
      )
    : searchedArtPieces;
  const isFiltered = searchQuery !== "";

  const searchStatus = isFiltered && (
    <>
      {/* "Show all" is the clear button in the search field */}
      <p className="search-status">Results for &ldquo;{searchQuery}&rdquo;</p>
      {shownArtPieces.length === 0 && (
        <p className="search-status">No art pieces found</p>
      )}
    </>
  );

  // the gallery and the favorites hang in a 3D hallway, with the search
  // status on its runway; the hallway stays when nothing matches
  if (isHallway || isFavoritesHallway) {
    return (
      <Hallway
        artPieces={isFavoritesHallway ? artPieces : shownArtPieces}
        artPiecesInfo={artPiecesInfo}
        onToggleFavorite={onToggleFavorite}
        filledSlugs={
          isFavoritesHallway
            ? shownArtPieces.map((artPiece) => artPiece.slug)
            : undefined
        }
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

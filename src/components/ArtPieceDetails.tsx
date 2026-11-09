import { useNavigate, useParams } from "react-router";

import type { ArtPiece, ArtPieceInfo } from "../types";
import { getComments, isFavorite } from "../utils/artPiecesInfo";
import ColorPalette from "./ColorPalette";
import CommentForm from "./CommentForm";
import Comments from "./Comments";
import FavoriteButton from "./FavoriteButton";

type ArtPieceDetailsProps = {
  artPieces: ArtPiece[];
  artPiecesInfo: ArtPieceInfo[];
  onToggleFavorite: (slug: string) => void;
  onAddComment: (slug: string, text: string) => void;
  onEditComment: (slug: string, id: string, text: string) => void;
  onDeleteComment: (slug: string, id: string) => void;
};

export default function ArtPieceDetails({
  artPieces,
  artPiecesInfo,
  onToggleFavorite,
  onAddComment,
  onEditComment,
  onDeleteComment,
}: ArtPieceDetailsProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const artPiece = artPieces.find((piece) => piece.slug === slug);

  // goes to the list, not "browser back", so it also works for a link opened directly
  const backButton = (
    <button type="button" onClick={() => navigate("/art-pieces")}>
      Back to gallery
    </button>
  );

  if (!artPiece) {
    return (
      <section className="details">
        <h1>Art piece not found</h1>
        {backButton}
      </section>
    );
  }

  const { name, artist, imageSource, year, genre, colors } = artPiece;

  return (
    <section className="details">
      {backButton}
      <FavoriteButton
        isFavorite={isFavorite(artPiecesInfo, artPiece.slug)}
        onToggleFavorite={() => onToggleFavorite(artPiece.slug)}
      />
      <img src={imageSource} alt={`${name} by ${artist}`} />
      <h1>{name}</h1>
      <dl>
        <dt>Artist</dt>
        <dd>{artist}</dd>
        <dt>Year</dt>
        <dd>{year}</dd>
        <dt>Genre</dt>
        <dd>{genre}</dd>
      </dl>
      <ColorPalette colors={colors} />
      <Comments
        comments={getComments(artPiecesInfo, artPiece.slug)}
        onEditComment={(id, text) => onEditComment(artPiece.slug, id, text)}
        onDeleteComment={(id) => onDeleteComment(artPiece.slug, id)}
      />
      <CommentForm onAddComment={(text) => onAddComment(artPiece.slug, text)} />
    </section>
  );
}

import { useNavigate, useParams } from "react-router";

import type { ArtPiece, ArtPieceInfo } from "../types";
import { getComments, isFavorite } from "../utils/artPiecesInfo";
import ColorPalette from "./ColorPalette";
import CommentForm from "./CommentForm";
import Comments from "./Comments";
import FavoriteButton from "./FavoriteButton";
import "./ArtPieceDetails.css";

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
    <button
      type="button"
      className="details-back"
      onClick={() => navigate("/art-pieces")}
    >
      <span aria-hidden="true">←</span> Back to gallery
    </button>
  );

  // the page is a private viewing room of the royal gallery
  if (!artPiece) {
    return (
      <section className="details details-room">
        <div className="details-placard">
          <h1>Art piece not found</h1>
        </div>
        {backButton}
      </section>
    );
  }

  const { name, artist, imageSource, year, genre, colors } = artPiece;

  return (
    <section className="details details-room">
      {/* the art piece in its golden frame, under a brass lamp */}
      <div className="details-artwork">
        {/* the lamp and its light are only decoration */}
        <span className="details-lamp" aria-hidden="true" />
        <span className="details-light" aria-hidden="true" />
        <div className="details-frame">
          <img src={imageSource} alt={`${name} by ${artist}`} />
          <FavoriteButton
            isFavorite={isFavorite(artPiecesInfo, artPiece.slug)}
            onToggleFavorite={() => onToggleFavorite(artPiece.slug)}
          />
        </div>
      </div>
      {/* the museum placard next to the frame */}
      <div className="details-placard">
        <h1>{name}</h1>
        <p className="details-artist">{artist}</p>
        <dl>
          <div>
            <dt>Year</dt>
            <dd>{year}</dd>
          </div>
          <div>
            <dt>Genre</dt>
            <dd>{genre}</dd>
          </div>
        </dl>
      </div>
      <div className="details-panel">
        {/* the key resets the palette when a similar art piece is opened */}
        <ColorPalette
          key={artPiece.slug}
          colors={colors}
          artPieces={artPieces}
          currentSlug={artPiece.slug}
        />
      </div>
      {/* the guest book with the comments */}
      <div className="details-panel details-guestbook">
        <Comments
          comments={getComments(artPiecesInfo, artPiece.slug)}
          onEditComment={(id, text) => onEditComment(artPiece.slug, id, text)}
          onDeleteComment={(id) => onDeleteComment(artPiece.slug, id)}
        />
        <CommentForm
          onAddComment={(text) => onAddComment(artPiece.slug, text)}
        />
      </div>
      {/* at the end of the room, after the guest book */}
      {backButton}
    </section>
  );
}

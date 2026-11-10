import type { KeyboardEvent, Ref } from "react";
import { Link } from "react-router";

import type { ArtPiece } from "../types";
import FavoriteButton from "./FavoriteButton";
import "./HallwayFrontView.css";

type HallwayFrontViewProps = {
  artPiece: ArtPiece;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  ref?: Ref<HTMLElement>;
};

// the art piece the user points at, large and facing the user, in front of
// the hallway, with all its details, its favorite button and a link to its
// details page
export default function HallwayFrontView({
  artPiece,
  isFavorite,
  onToggleFavorite,
  onPointerEnter,
  onPointerLeave,
  onKeyDown,
  ref,
}: HallwayFrontViewProps) {
  const { slug, name, artist, year, genre, imageSource } = artPiece;
  const headingId = `hallway-front-view-${slug}`;

  return (
    <div className="hallway-front-view">
      {/* dims the hallway behind the art piece */}
      <div className="hallway-front-view-backdrop" aria-hidden="true" />
      <section
        ref={ref}
        className="hallway-front-view-card"
        role="dialog"
        aria-labelledby={headingId}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
      >
        <div className="hallway-front-view-frame">
          {/* for the mouse only: keyboard and screen readers use the
              View details link, so the art piece is not read twice */}
          <Link to={`/art-pieces/${slug}`} tabIndex={-1} aria-hidden="true">
            <img src={imageSource} alt={`${name} by ${artist}`} />
          </Link>
          <FavoriteButton
            isFavorite={isFavorite}
            onToggleFavorite={() => onToggleFavorite(slug)}
          />
        </div>
        <div className="hallway-front-view-details">
          <h2 id={headingId}>{name}</h2>
          <p className="hallway-front-view-artist">{artist}</p>
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
          <Link className="hallway-front-view-link" to={`/art-pieces/${slug}`}>
            View details
          </Link>
        </div>
      </section>
    </div>
  );
}

import { useState, type SubmitEvent } from "react";

import type { ArtPiece, ArtPieceInfo } from "../types";
import { isFavorite } from "../utils/artPiecesInfo";
import "./Profile.css";

type ProfileProps = {
  profileName: string;
  artPieces: ArtPiece[];
  artPiecesInfo: ArtPieceInfo[];
  onChangeProfileName: (name: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
};

// a plaque with a big number; screen readers hear the label and the number
// together, e.g. "Art pieces: 11"
function Plaque({ label, count }: { label: string; count: number }) {
  return (
    <li className="office-plaque">
      <span className="visually-hidden">{`${label}: ${count}`}</span>
      <span className="office-plaque-count" aria-hidden="true">
        {count}
      </span>
      <span className="office-plaque-label" aria-hidden="true">
        {label}
      </span>
    </li>
  );
}

// the Profile page is the curator's office of the royal gallery
export default function Profile({
  profileName,
  artPieces,
  artPiecesInfo,
  onChangeProfileName,
  isDarkMode,
  onToggleDarkMode,
}: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(profileName);

  // only favorites whose art piece exists in the fetched data count
  const favoritesCount = artPieces.filter((artPiece) =>
    isFavorite(artPiecesInfo, artPiece.slug)
  ).length;
  const trimmedName = draftName.trim();

  function startEditing() {
    setDraftName(profileName);
    setIsEditing(true);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    // whitespace only counts as empty
    if (!trimmedName) {
      return;
    }

    onChangeProfileName(trimmedName);
    setIsEditing(false);
  }

  return (
    <div className="office">
      <section className="profile office-desk" aria-labelledby="profile-name">
        {/* the name on a brass nameplate */}
        {isEditing ? (
          <form
            className="profile-form office-nameplate"
            onSubmit={handleSubmit}
          >
            <label htmlFor="profile-name-input">Profile name</label>
            <input
              id="profile-name-input"
              name="profileName"
              required
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
            />
            <button type="submit" disabled={!trimmedName}>
              Save
            </button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <div className="profile-name office-nameplate">
            <h2 id="profile-name">{profileName}</h2>
            <button type="button" onClick={startEditing}>
              Edit name
            </button>
          </div>
        )}
        <ul className="profile-stats office-plaques">
          <Plaque label="Art pieces" count={artPieces.length} />
          <Plaque label="Favorites" count={favoritesCount} />
        </ul>
      </section>
      <section
        className="settings office-panel"
        aria-labelledby="settings-heading"
      >
        <h2 id="settings-heading">Settings</h2>
        {/* a switch: screen readers announce its on/off state via aria-checked */}
        <button
          type="button"
          role="switch"
          className="theme-switch"
          aria-checked={isDarkMode}
          onClick={onToggleDarkMode}
        >
          Dark mode
          <span className="theme-switch-track" aria-hidden="true" />
          <span className="theme-switch-state" aria-hidden="true">
            {isDarkMode ? "On" : "Off"}
          </span>
        </button>
      </section>
    </div>
  );
}

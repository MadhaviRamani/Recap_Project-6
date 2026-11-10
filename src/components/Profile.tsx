import { useState, type FormEvent } from "react";

import type { ArtPiece, ArtPieceInfo } from "../types";
import { isFavorite } from "../utils/artPiecesInfo";

type ProfileProps = {
  profileName: string;
  artPieces: ArtPiece[];
  artPiecesInfo: ArtPieceInfo[];
  onChangeProfileName: (name: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
};

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // whitespace only counts as empty
    if (!trimmedName) {
      return;
    }

    onChangeProfileName(trimmedName);
    setIsEditing(false);
  }

  return (
    <>
      <section className="profile" aria-labelledby="profile-name">
        {isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
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
          <div className="profile-name">
            <h2 id="profile-name">{profileName}</h2>
            <button type="button" onClick={startEditing}>
              Edit name
            </button>
          </div>
        )}
        <ul className="profile-stats">
          <li>Art pieces: {artPieces.length}</li>
          <li>Favorites: {favoritesCount}</li>
        </ul>
      </section>
      <section className="settings" aria-labelledby="settings-heading">
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
    </>
  );
}

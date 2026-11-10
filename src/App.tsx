import { useEffect, useState } from "react";
import { Route, Routes } from "react-router";
import useSWR from "swr";

import ArtPieceDetails from "./components/ArtPieceDetails";
import ArtPieces from "./components/ArtPieces";
import Navigation from "./components/Navigation";
import Profile from "./components/Profile";
import Spotlight from "./components/Spotlight";
import type { ArtPiece, ArtPieceInfo } from "./types";
import {
  addComment,
  deleteComment,
  editComment,
  isFavorite,
  toggleFavorite,
} from "./utils/artPiecesInfo";
import {
  loadArtPiecesInfo,
  saveArtPiecesInfo,
} from "./utils/artPiecesInfoStorage";
import "./styles.css";

const API_URL = "https://example-apis.vercel.app/api/art";
const DEFAULT_PROFILE_NAME = "Art Lover";

export async function fetcher(url: string): Promise<ArtPiece[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch art pieces (status ${response.status})`);
  }

  const data: ArtPiece[] = await response.json();
  return data;
}

export default function App() {
  const { data: artPieces, error } = useSWR<ArtPiece[], Error>(
    API_URL,
    fetcher
  );
  // own information (favorites, comments), shared by all routes; the fetched art pieces stay unchanged
  // read from the local storage once, when the state is created
  const [artPiecesInfo, setArtPiecesInfo] =
    useState<ArtPieceInfo[]>(loadArtPiecesInfo);

  const [profileName, setProfileName] = useState<string>(DEFAULT_PROFILE_NAME);
  // the app starts in the light theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    saveArtPiecesInfo(artPiecesInfo);
  }, [artPiecesInfo]);

  // the theme is set on <html>, so it applies to the whole app, also the navigation
  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  function handleToggleDarkMode() {
    setIsDarkMode((current) => !current);
  }

  function handleToggleFavorite(slug: string) {
    setArtPiecesInfo((currentInfo) => toggleFavorite(currentInfo, slug));
  }

  function handleAddComment(slug: string, text: string) {
    const comment = {
      id: crypto.randomUUID(),
      text,
      date: new Date().toISOString(),
    };
    setArtPiecesInfo((currentInfo) => addComment(currentInfo, slug, comment));
  }

  function handleEditComment(slug: string, id: string, text: string) {
    setArtPiecesInfo((currentInfo) => editComment(currentInfo, slug, id, text));
  }

  function handleDeleteComment(slug: string, id: string) {
    setArtPiecesInfo((currentInfo) => deleteComment(currentInfo, slug, id));
  }

  let content;

  if (error) {
    content = (
      <p role="alert">Could not load the art pieces. Please try again.</p>
    );
  } else if (artPieces) {
    content = (
      <Routes>
        <Route
          path="/"
          element={
            <>
              {/* hidden on screen, where the stage fills the page;
                  screen readers still get the page heading */}
              <h1 className="visually-hidden">Spotlight</h1>
              <Spotlight
                artPieces={artPieces}
                artPiecesInfo={artPiecesInfo}
                onToggleFavorite={handleToggleFavorite}
              />
            </>
          }
        />
        <Route
          path="/art-pieces"
          element={
            <>
              {/* hidden on screen, where the hallway fills the page;
                  screen readers still get the page heading */}
              <h1 className="visually-hidden">Gallery</h1>
              <ArtPieces
                artPieces={artPieces}
                artPiecesInfo={artPiecesInfo}
                onToggleFavorite={handleToggleFavorite}
                isSearchable
              />
            </>
          }
        />
        <Route
          path="/art-pieces/:slug"
          element={
            <ArtPieceDetails
              artPieces={artPieces}
              artPiecesInfo={artPiecesInfo}
              onToggleFavorite={handleToggleFavorite}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          }
        />
        <Route
          path="/favorites"
          element={
            <>
              <h1>Favorites</h1>
              <ArtPieces
                artPieces={artPieces.filter((artPiece) =>
                  isFavorite(artPiecesInfo, artPiece.slug)
                )}
                artPiecesInfo={artPiecesInfo}
                onToggleFavorite={handleToggleFavorite}
              />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <h1>Profile</h1>
              <Profile
                profileName={profileName}
                artPieces={artPieces}
                artPiecesInfo={artPiecesInfo}
                onChangeProfileName={setProfileName}
                isDarkMode={isDarkMode}
                onToggleDarkMode={handleToggleDarkMode}
              />
            </>
          }
        />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    );
  } else {
    content = <p>Loading…</p>;
  }

  return (
    <>
      {/* rendered once, outside the routes, so it appears on every page;
          before main, so keyboard and screen readers reach it first like on screen */}
      <Navigation />
      <main>{content}</main>
    </>
  );
}

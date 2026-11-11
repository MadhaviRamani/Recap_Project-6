import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router";
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
  toggleFavorite,
} from "./utils/artPiecesInfo";
import {
  loadArtPiecesInfo,
  saveArtPiecesInfo,
} from "./utils/artPiecesInfoStorage";
import {
  loadIsDarkMode,
  loadProfileName,
  saveIsDarkMode,
  saveProfileName,
} from "./utils/profileStorage";
import "./styles.css";

const API_URL = "https://example-apis.vercel.app/api/art";
const DEFAULT_PROFILE_NAME = "Art Lover";

// the search from the search bar in the navigation; it belongs to the page
// it was made on, so every other page starts with all its art pieces
type Search = {
  pathname: string;
  query: string;
};

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

  // read from the local storage once, when the state is created
  const [profileName, setProfileName] = useState<string>(() =>
    loadProfileName(DEFAULT_PROFILE_NAME)
  );
  // the app starts in the dark theme, the look of the royal gallery,
  // unless dark mode was turned off before
  const [isDarkMode, setIsDarkMode] = useState<boolean>(loadIsDarkMode);

  const { pathname } = useLocation();
  const [search, setSearch] = useState<Search>({ pathname, query: "" });
  // moving to another page clears the search; it is reset while rendering,
  // so the new page never shows the old search first
  if (search.pathname !== pathname) {
    setSearch({ pathname, query: "" });
  }
  const isSearchOnPage = search.pathname === pathname;
  const searchQuery = isSearchOnPage ? search.query : "";

  useEffect(() => {
    saveArtPiecesInfo(artPiecesInfo);
  }, [artPiecesInfo]);

  useEffect(() => {
    saveProfileName(profileName);
  }, [profileName]);

  // the theme is set on <html>, so it applies to the whole app, also the navigation
  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    saveIsDarkMode(isDarkMode);
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

  function handleSearch(query: string) {
    setSearch({ pathname, query });
  }

  function handleShowAll() {
    setSearch({ pathname, query: "" });
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
                isHallway
                searchQuery={searchQuery}
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
              {/* hidden on screen, like on the Gallery */}
              <h1 className="visually-hidden">Favorites</h1>
              {/* every art piece has its frame, only the favorites fill it */}
              <ArtPieces
                artPieces={artPieces}
                artPiecesInfo={artPiecesInfo}
                onToggleFavorite={handleToggleFavorite}
                isFavoritesHallway
                searchQuery={searchQuery}
              />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <h1>Curator&apos;s Office</h1>
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
      <Navigation
        search={{
          query: searchQuery,
          onSearch: handleSearch,
          onShowAll: handleShowAll,
        }}
      />
      <main>{content}</main>
    </>
  );
}

import { Route, Routes } from "react-router";
import useSWR from "swr";

import ArtPieces from "./components/ArtPieces";
import Navigation from "./components/Navigation";
import Spotlight from "./components/Spotlight";
import type { ArtPiece } from "./types";
import "./styles.css";

const API_URL = "https://example-apis.vercel.app/api/art";

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
              <h1>Spotlight</h1>
              <Spotlight artPieces={artPieces} />
            </>
          }
        />
        <Route
          path="/art-pieces"
          element={
            <>
              <h1>Gallery</h1>
              <ArtPieces artPieces={artPieces} />
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
      <main>{content}</main>
      {/* rendered once, outside the routes, so it appears on every page */}
      <Navigation />
    </>
  );
}

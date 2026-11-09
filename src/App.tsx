import { Route, Routes } from "react-router";
import useSWR from "swr";

import ArtPieces from "./components/ArtPieces";
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

  if (error) {
    return (
      <main>
        <p role="alert">Could not load the art pieces. Please try again.</p>
      </main>
    );
  }

  if (!artPieces) {
    return (
      <main>
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <Routes>
        <Route
          path="/art-pieces"
          element={
            <>
              <h1>Gallery</h1>
              <ArtPieces artPieces={artPieces} />
            </>
          }
        />
      </Routes>
    </main>
  );
}

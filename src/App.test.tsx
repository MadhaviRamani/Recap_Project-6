import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";

import App, { fetcher } from "./App";
import type { ArtPiece } from "./types";

const artPieces: ArtPiece[] = [
  {
    slug: "wheat-field-with-cypresses",
    artist: "Vincent van Gogh",
    name: "Wheat Field with Cypresses",
    imageSource: "https://example.com/wheat-field.jpg",
  },
  {
    slug: "the-harvesters",
    artist: "Pieter Bruegel the Elder",
    name: "The Harvesters",
    imageSource: "https://example.com/the-harvesters.jpg",
  },
];

function mockFetch(response: { ok: boolean; status?: number; data?: unknown }) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: response.ok,
      status: response.status ?? 200,
      json: async () => response.data,
    })
  );
}

function renderApp(route = "/art-pieces") {
  render(
    // a fresh cache per test, so no test sees the data of another one
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </SWRConfig>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("shows a loading state while the art pieces are fetched", async () => {
  mockFetch({ ok: true, data: artPieces });

  renderApp();

  expect(screen.getByText("Loading…")).toBeInTheDocument();
  // the loading state is replaced by the list once the data arrives
  expect(await screen.findAllByRole("listitem")).toHaveLength(2);
  expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
});

test("shows all art pieces on the route /art-pieces", async () => {
  mockFetch({ ok: true, data: artPieces });

  renderApp("/art-pieces");

  expect(await screen.findAllByRole("listitem")).toHaveLength(2);
  expect(
    screen.getByRole("heading", { name: "The Harvesters" })
  ).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith("https://example-apis.vercel.app/api/art");
});

test("shows an error state when the art pieces cannot be fetched", async () => {
  mockFetch({ ok: false, status: 500 });

  renderApp();

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not load the art pieces"
  );
});

test("fetcher throws when the response is not ok", async () => {
  mockFetch({ ok: false, status: 404 });

  await expect(fetcher("/api/art")).rejects.toThrow("status 404");
});

test("fetcher returns the art pieces when the response is ok", async () => {
  mockFetch({ ok: true, data: artPieces });

  await expect(fetcher("/api/art")).resolves.toEqual(artPieces);
});

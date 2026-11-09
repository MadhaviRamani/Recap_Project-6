import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  vi.restoreAllMocks();
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

test("shows a random art piece as spotlight on the route /", async () => {
  mockFetch({ ok: true, data: artPieces });
  vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
    (array as Uint32Array)[0] = 1;
    return array;
  });

  renderApp("/");

  expect(
    await screen.findByRole("img", {
      name: "The Harvesters by Pieter Bruegel the Elder",
    })
  ).toBeInTheDocument();
  expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
});

test("clicking Gallery shows the Gallery page", async () => {
  const user = userEvent.setup();
  mockFetch({ ok: true, data: artPieces });

  renderApp("/");
  await user.click(await screen.findByRole("link", { name: "Gallery" }));

  expect(
    await screen.findByRole("heading", { level: 1, name: "Gallery" })
  ).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});

test("clicking Spotlight shows the Spotlight page", async () => {
  const user = userEvent.setup();
  mockFetch({ ok: true, data: artPieces });

  renderApp("/art-pieces");
  await screen.findAllByRole("listitem");
  await user.click(screen.getByRole("link", { name: "Spotlight" }));

  expect(
    screen.getByRole("heading", { level: 1, name: "Spotlight" })
  ).toBeInTheDocument();
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
});

test("shows Page not found for an unknown URL", async () => {
  mockFetch({ ok: true, data: artPieces });

  renderApp("/does-not-exist");

  expect(
    await screen.findByRole("heading", { name: "Page not found" })
  ).toBeInTheDocument();
});

test("shows the navigation while the art pieces are loading", async () => {
  mockFetch({ ok: true, data: artPieces });

  renderApp();

  expect(screen.getByText("Loading…")).toBeInTheDocument();
  expect(screen.getByRole("navigation")).toBeInTheDocument();
  // let the fetch finish inside the test
  await screen.findAllByRole("listitem");
});

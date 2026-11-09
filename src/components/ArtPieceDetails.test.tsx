import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

import type { ArtPiece } from "../types";
import ArtPieceDetails from "./ArtPieceDetails";

const artPieces: ArtPiece[] = [
  {
    slug: "wheat-field-with-cypresses",
    year: "1889",
    genre: "Landscape Painting",
    artist: "Vincent van Gogh",
    name: "Wheat Field with Cypresses",
    imageSource: "https://example.com/wheat-field.jpg",
  },
  {
    slug: "the-harvesters",
    year: "1565",
    genre: "Genre Painting",
    artist: "Pieter Bruegel the Elder",
    name: "The Harvesters",
    imageSource: "https://example.com/the-harvesters.jpg",
  },
];

// renders the details on their dynamic route, next to a stand-in list route
function renderDetails(route: string) {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/art-pieces" element={<h1>Gallery list</h1>} />
        <Route
          path="/art-pieces/:slug"
          element={<ArtPieceDetails artPieces={artPieces} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

test("shows the image of the art piece from the URL", () => {
  renderDetails("/art-pieces/the-harvesters");

  expect(
    screen.getByRole("img", {
      name: "The Harvesters by Pieter Bruegel the Elder",
    })
  ).toHaveAttribute("src", "https://example.com/the-harvesters.jpg");
});

test("shows the title of the art piece", () => {
  renderDetails("/art-pieces/the-harvesters");

  expect(
    screen.getByRole("heading", { level: 1, name: "The Harvesters" })
  ).toBeInTheDocument();
});

test("shows the artist, year and genre of the art piece", () => {
  renderDetails("/art-pieces/the-harvesters");

  expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
  expect(screen.getByText("1565")).toBeInTheDocument();
  expect(screen.getByText("Genre Painting")).toBeInTheDocument();
});

test("shows a back button", () => {
  renderDetails("/art-pieces/the-harvesters");

  expect(
    screen.getByRole("button", { name: "Back to gallery" })
  ).toBeInTheDocument();
});

test("clicking the back button navigates to the list view", async () => {
  const user = userEvent.setup();
  renderDetails("/art-pieces/the-harvesters");

  await user.click(screen.getByRole("button", { name: "Back to gallery" }));

  expect(
    screen.getByRole("heading", { name: "Gallery list" })
  ).toBeInTheDocument();
});

test("shows Art piece not found for an unknown slug", async () => {
  const user = userEvent.setup();
  renderDetails("/art-pieces/does-not-exist");

  expect(
    screen.getByRole("heading", { name: "Art piece not found" })
  ).toBeInTheDocument();

  // the way back to the list also works here
  await user.click(screen.getByRole("button", { name: "Back to gallery" }));
  expect(
    screen.getByRole("heading", { name: "Gallery list" })
  ).toBeInTheDocument();
});

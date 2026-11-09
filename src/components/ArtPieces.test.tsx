import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import ArtPieces from "./ArtPieces";

const artPieces: ArtPiece[] = [
  {
    slug: "wheat-field-with-cypresses",
    year: "1889",
    genre: "Landscape Painting",
    artist: "Vincent van Gogh",
    name: "Wheat Field with Cypresses",
    imageSource: "https://example.com/wheat-field.jpg",
    colors: ["#37412E", "#8D7332", "#838665", "#718F98", "#9DA59E"],
  },
  {
    slug: "the-harvesters",
    year: "1565",
    genre: "Genre Painting",
    artist: "Pieter Bruegel the Elder",
    name: "The Harvesters",
    imageSource: "https://example.com/the-harvesters.jpg",
    colors: ["#4D3C25", "#9A692E", "#7C8263", "#B78D53", "#C7B7A4"],
  },
];

test("shows every art piece in a list", () => {
  // the previews contain Links, which need a router
  render(
    <MemoryRouter>
      <ArtPieces
        artPieces={artPieces}
        artPiecesInfo={[]}
        onToggleFavorite={vi.fn()}
      />
    </MemoryRouter>
  );

  expect(screen.getByRole("list")).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(
    screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "The Harvesters" })
  ).toBeInTheDocument();
});

test("shows a favorite button on each entry and highlights the favorites", () => {
  render(
    <MemoryRouter>
      <ArtPieces
        artPieces={artPieces}
        artPiecesInfo={[
          { slug: "the-harvesters", isFavorite: true, comments: [] },
        ]}
        onToggleFavorite={vi.fn()}
      />
    </MemoryRouter>
  );

  const buttons = screen.getAllByRole("button", { name: "Favorite" });
  expect(buttons).toHaveLength(2);
  expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
  expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
});

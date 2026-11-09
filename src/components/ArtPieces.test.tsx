import { render, screen } from "@testing-library/react";

import type { ArtPiece } from "../types";
import ArtPieces from "./ArtPieces";

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

test("shows every art piece in a list", () => {
  render(<ArtPieces artPieces={artPieces} />);

  expect(screen.getByRole("list")).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(
    screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "The Harvesters" })
  ).toBeInTheDocument();
});

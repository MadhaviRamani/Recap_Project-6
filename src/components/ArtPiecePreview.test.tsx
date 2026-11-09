import { render, screen } from "@testing-library/react";

import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

const artPiece: ArtPiece = {
  slug: "wheat-field-with-cypresses",
  artist: "Vincent van Gogh",
  name: "Wheat Field with Cypresses",
  imageSource:
    "https://example-apis.vercel.app/assets/art/wheat-field-with-cypresses.jpg",
};

test("shows the image of the art piece", () => {
  render(<ArtPiecePreview artPiece={artPiece} />);

  const image = screen.getByRole("img", {
    name: "Wheat Field with Cypresses by Vincent van Gogh",
  });
  expect(image).toHaveAttribute("src", artPiece.imageSource);
});

test("shows the title of the art piece", () => {
  render(<ArtPiecePreview artPiece={artPiece} />);

  expect(
    screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
  ).toBeInTheDocument();
});

test("shows the name of the artist", () => {
  render(<ArtPiecePreview artPiece={artPiece} />);

  expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
});

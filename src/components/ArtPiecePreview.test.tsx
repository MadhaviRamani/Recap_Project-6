import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

const artPiece: ArtPiece = {
  slug: "wheat-field-with-cypresses",
  year: "1889",
  genre: "Landscape Painting",
  artist: "Vincent van Gogh",
  name: "Wheat Field with Cypresses",
  imageSource:
    "https://example-apis.vercel.app/assets/art/wheat-field-with-cypresses.jpg",
};

// the preview contains a Link, which needs a router
function renderPreview() {
  render(
    <MemoryRouter>
      <ArtPiecePreview artPiece={artPiece} />
    </MemoryRouter>
  );
}

test("shows the image of the art piece", () => {
  renderPreview();

  const image = screen.getByRole("img", {
    name: "Wheat Field with Cypresses by Vincent van Gogh",
  });
  expect(image).toHaveAttribute("src", artPiece.imageSource);
});

test("shows the title of the art piece", () => {
  renderPreview();

  expect(
    screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
  ).toBeInTheDocument();
});

test("shows the name of the artist", () => {
  renderPreview();

  expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
});

test("links to the details page of the art piece", () => {
  renderPreview();

  expect(screen.getByRole("link")).toHaveAttribute(
    "href",
    "/art-pieces/wheat-field-with-cypresses"
  );
});

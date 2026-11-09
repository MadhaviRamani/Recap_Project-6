import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
function renderPreview(isFavorite = false, onToggleFavorite = vi.fn()) {
  render(
    <MemoryRouter>
      <ArtPiecePreview
        artPiece={artPiece}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
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

test("shows the favorite button with the favorite status", () => {
  renderPreview(true);

  expect(screen.getByRole("button", { name: "Favorite" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});

test("clicking the favorite button toggles the favorite of this art piece", async () => {
  const user = userEvent.setup();
  const onToggleFavorite = vi.fn();
  renderPreview(false, onToggleFavorite);

  await user.click(screen.getByRole("button", { name: "Favorite" }));

  expect(onToggleFavorite).toHaveBeenCalledWith("wheat-field-with-cypresses");
});

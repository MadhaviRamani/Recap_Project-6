import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import HallwayFrontView from "./HallwayFrontView";

const artPiece: ArtPiece = {
  slug: "the-harvesters",
  year: "1565",
  genre: "Genre Painting",
  artist: "Pieter Bruegel the Elder",
  name: "The Harvesters",
  imageSource: "https://example.com/the-harvesters.jpg",
  colors: ["#4D3C25"],
};

function renderFrontView(isFavorite = false, onToggleFavorite = vi.fn()) {
  render(
    <MemoryRouter>
      <HallwayFrontView
        artPiece={artPiece}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    </MemoryRouter>
  );
}

test("shows the art piece with all its details, named after it", () => {
  renderFrontView();

  const frontView = screen.getByRole("dialog", { name: "The Harvesters" });
  expect(frontView).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "The Harvesters" })
  ).toBeInTheDocument();
  expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
  expect(screen.getByText("Year")).toBeInTheDocument();
  expect(screen.getByText("1565")).toBeInTheDocument();
  expect(screen.getByText("Genre")).toBeInTheDocument();
  expect(screen.getByText("Genre Painting")).toBeInTheDocument();
});

test("the image and View details link to the details page", () => {
  renderFrontView();

  const image = screen.getByAltText(
    "The Harvesters by Pieter Bruegel the Elder"
  );
  expect(image).toHaveAttribute(
    "src",
    "https://example.com/the-harvesters.jpg"
  );
  expect(image.closest("a")).toHaveAttribute(
    "href",
    "/art-pieces/the-harvesters"
  );
  expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute(
    "href",
    "/art-pieces/the-harvesters"
  );
});

test("shows whether the art piece is a favorite", () => {
  renderFrontView(true);

  expect(screen.getByRole("button", { name: "Favorite" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});

test("clicking the favorite button toggles the favorite of the art piece", async () => {
  const user = userEvent.setup();
  const handleToggleFavorite = vi.fn();
  renderFrontView(false, handleToggleFavorite);

  await user.click(screen.getByRole("button", { name: "Favorite" }));

  expect(handleToggleFavorite).toHaveBeenCalledTimes(1);
  expect(handleToggleFavorite).toHaveBeenCalledWith("the-harvesters");
});

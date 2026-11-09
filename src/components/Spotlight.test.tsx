import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ArtPiece } from "../types";
import Spotlight from "./Spotlight";

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

function mockRandomValue(value: number) {
  return vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
    (array as Uint32Array)[0] = value;
    return array;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

test("shows the image of the randomly selected art piece", () => {
  mockRandomValue(1);

  render(
    <Spotlight
      artPieces={artPieces}
      artPiecesInfo={[]}
      onToggleFavorite={vi.fn()}
    />
  );

  const image = screen.getByRole("img", {
    name: "The Harvesters by Pieter Bruegel the Elder",
  });
  expect(image).toHaveAttribute(
    "src",
    "https://example.com/the-harvesters.jpg"
  );
});

test("shows the title of the randomly selected art piece", () => {
  mockRandomValue(1);

  render(
    <Spotlight
      artPieces={artPieces}
      artPiecesInfo={[]}
      onToggleFavorite={vi.fn()}
    />
  );

  expect(
    screen.getByRole("heading", { name: "The Harvesters" })
  ).toBeInTheDocument();
});

test("shows the artist of the randomly selected art piece", () => {
  mockRandomValue(0);

  render(
    <Spotlight
      artPieces={artPieces}
      artPiecesInfo={[]}
      onToggleFavorite={vi.fn()}
    />
  );

  expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
});

test("keeps the same art piece when it re-renders", () => {
  const getRandomValues = mockRandomValue(0);

  const { rerender } = render(
    <Spotlight
      artPieces={artPieces}
      artPiecesInfo={[]}
      onToggleFavorite={vi.fn()}
    />
  );
  // a re-render would pick the other art piece if it were selected again
  getRandomValues.mockImplementation((array) => {
    (array as Uint32Array)[0] = 1;
    return array;
  });
  rerender(
    <Spotlight
      artPieces={artPieces}
      artPiecesInfo={[]}
      onToggleFavorite={vi.fn()}
    />
  );

  expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
  expect(getRandomValues).toHaveBeenCalledTimes(1);
});

test("shows nothing when there are no art pieces", () => {
  const { container } = render(
    <Spotlight artPieces={[]} artPiecesInfo={[]} onToggleFavorite={vi.fn()} />
  );

  expect(container).toBeEmptyDOMElement();
});

test("shows the favorite button and toggles the spotlighted art piece", async () => {
  const user = userEvent.setup();
  const onToggleFavorite = vi.fn();
  mockRandomValue(1);
  render(
    <Spotlight
      artPieces={artPieces}
      artPiecesInfo={[
        { slug: "the-harvesters", isFavorite: true, comments: [] },
      ]}
      onToggleFavorite={onToggleFavorite}
    />
  );

  const button = screen.getByRole("button", { name: "Favorite" });
  expect(button).toHaveAttribute("aria-pressed", "true");

  await user.click(button);
  expect(onToggleFavorite).toHaveBeenCalledWith("the-harvesters");
});

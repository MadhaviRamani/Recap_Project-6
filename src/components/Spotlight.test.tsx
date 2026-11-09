import { render, screen } from "@testing-library/react";

import type { ArtPiece } from "../types";
import Spotlight from "./Spotlight";

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

  render(<Spotlight artPieces={artPieces} />);

  const image = screen.getByRole("img", {
    name: "The Harvesters by Pieter Bruegel the Elder",
  });
  expect(image).toHaveAttribute(
    "src",
    "https://example.com/the-harvesters.jpg"
  );
});

test("shows the artist of the randomly selected art piece", () => {
  mockRandomValue(0);

  render(<Spotlight artPieces={artPieces} />);

  expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
});

test("keeps the same art piece when it re-renders", () => {
  const getRandomValues = mockRandomValue(0);

  const { rerender } = render(<Spotlight artPieces={artPieces} />);
  // a re-render would pick the other art piece if it were selected again
  getRandomValues.mockImplementation((array) => {
    (array as Uint32Array)[0] = 1;
    return array;
  });
  rerender(<Spotlight artPieces={artPieces} />);

  expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
  expect(getRandomValues).toHaveBeenCalledTimes(1);
});

test("shows nothing when there are no art pieces", () => {
  const { container } = render(<Spotlight artPieces={[]} />);

  expect(container).toBeEmptyDOMElement();
});

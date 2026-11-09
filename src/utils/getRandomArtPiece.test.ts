import type { ArtPiece } from "../types";
import { getRandomArtPiece } from "./getRandomArtPiece";

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
  {
    slug: "the-night-watch",
    artist: "Rembrandt",
    name: "The Night Watch",
    imageSource: "https://example.com/the-night-watch.jpg",
  },
];

function mockRandomValue(value: number) {
  vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
    (array as Uint32Array)[0] = value;
    return array;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

test("selects the art piece at the random index", () => {
  mockRandomValue(1);

  expect(getRandomArtPiece(artPieces)).toBe(artPieces[1]);
});

test("can select the first and the last art piece", () => {
  mockRandomValue(0);
  expect(getRandomArtPiece(artPieces)).toBe(artPieces[0]);

  // 5 % 3 = 2: large random values wrap around to a valid index
  mockRandomValue(5);
  expect(getRandomArtPiece(artPieces)).toBe(artPieces[2]);
});

test("always returns one of the given art pieces", () => {
  for (let i = 0; i < 20; i++) {
    expect(artPieces).toContain(getRandomArtPiece(artPieces));
  }
});

test("returns undefined for an empty list", () => {
  expect(getRandomArtPiece([])).toBeUndefined();
});

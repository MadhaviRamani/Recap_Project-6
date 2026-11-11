import type { ArtPiece } from "../types";
import { searchArtPieces } from "./searchArtPieces";

const wheatField: ArtPiece = {
  slug: "wheat-field-with-cypresses",
  year: "1889",
  genre: "Landscape Painting",
  artist: "Vincent van Gogh",
  name: "Wheat Field with Cypresses",
  imageSource: "https://example.com/wheat-field.jpg",
  colors: ["#37412E"],
};

const cardPlayers: ArtPiece = {
  slug: "the-card-players",
  year: "1892",
  genre: "Genre Painting",
  artist: "Paul Cézanne",
  name: "The Card Players",
  imageSource: "https://example.com/the-card-players.jpg",
  colors: ["#4D3C25"],
};

const greatWave: ArtPiece = {
  slug: "the-great-wave",
  year: "1831",
  genre: "Ukiyo-e Print",
  artist: "Katsushika Hokusai",
  name: "Under the Wave off Kanagawa (The Great Wave)",
  imageSource: "https://example.com/the-great-wave.jpg",
  colors: ["#718F98"],
};

const unknownArtist: ArtPiece = {
  slug: "untitled",
  year: "2000",
  genre: "Sketch",
  artist: "Unknown Artist",
  name: "Untitled",
  imageSource: "https://example.com/untitled.jpg",
  colors: ["#000000"],
};

const artPieces = [wheatField, cardPlayers, greatWave, unknownArtist];

test("finds art pieces by name", () => {
  expect(searchArtPieces(artPieces, "wheat")).toEqual([wheatField]);
});

test("finds art pieces by artist", () => {
  expect(searchArtPieces(artPieces, "hokusai")).toEqual([greatWave]);
});

test("finds art pieces by genre", () => {
  expect(searchArtPieces(artPieces, "landscape")).toEqual([wheatField]);
});

test("does not match the nationality as search text", () => {
  // the search looks only at name, artist and genre
  expect(searchArtPieces(artPieces, "dutch")).toEqual([]);
});

test("ignores upper and lower case", () => {
  const expected = [wheatField];

  expect(searchArtPieces(artPieces, "van gogh")).toEqual(expected);
  expect(searchArtPieces(artPieces, "VAN GOGH")).toEqual(expected);
  expect(searchArtPieces(artPieces, "Van Gogh")).toEqual(expected);
});

test("keeps spaces inside the search text and ignores them around it", () => {
  expect(searchArtPieces(artPieces, "  the card players  ")).toEqual([
    cardPlayers,
  ]);
  // the space matters: "thecard" is not in any field
  expect(searchArtPieces(artPieces, "thecard")).toEqual([]);
});

test("counts several spaces, tabs and non-breaking spaces as one space", () => {
  expect(searchArtPieces(artPieces, "van  gogh")).toEqual([wheatField]);
  expect(searchArtPieces(artPieces, "the   card\tplayers")).toEqual([
    cardPlayers,
  ]);
  expect(searchArtPieces(artPieces, "great\u00A0wave")).toEqual([greatWave]);
});

test("ignores accents", () => {
  expect(searchArtPieces(artPieces, "cezanne")).toEqual([cardPlayers]);
  expect(searchArtPieces(artPieces, "Cézanne")).toEqual([cardPlayers]);
});

test("returns all art pieces for an empty search or only spaces", () => {
  expect(searchArtPieces(artPieces, "")).toEqual(artPieces);
  expect(searchArtPieces(artPieces, "   ")).toEqual(artPieces);
});

test("returns no art pieces when nothing matches", () => {
  expect(searchArtPieces(artPieces, "sculpture")).toEqual([]);
});

test("does not change the art pieces", () => {
  const original = structuredClone(artPieces);

  searchArtPieces(artPieces, "dutch");

  expect(artPieces).toEqual(original);
});

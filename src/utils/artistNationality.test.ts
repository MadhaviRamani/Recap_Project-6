import { getArtistNationality, getNationalities } from "./artistNationality";

test("returns the nationality of a known artist", () => {
  expect(getArtistNationality("Vincent van Gogh")).toBe("Dutch");
  expect(getArtistNationality("Katsushika Hokusai")).toBe("Japanese");
});

test("returns undefined for an unknown artist", () => {
  expect(getArtistNationality("Unknown Artist")).toBeUndefined();
});

test("lists every nationality of the art pieces once, sorted", () => {
  const artPiece = {
    slug: "",
    name: "",
    imageSource: "",
    year: "",
    genre: "",
    colors: [],
  };

  expect(
    getNationalities([
      { ...artPiece, slug: "a", artist: "Katsushika Hokusai" },
      { ...artPiece, slug: "b", artist: "Vincent van Gogh" },
      { ...artPiece, slug: "c", artist: "Ogata Kōrin" },
      { ...artPiece, slug: "d", artist: "Unknown Artist" },
    ])
  ).toEqual(["Dutch", "Japanese"]);
});

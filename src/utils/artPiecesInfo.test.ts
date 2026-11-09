import type { ArtPieceInfo } from "../types";
import { isFavorite, toggleFavorite } from "./artPiecesInfo";

const artPiecesInfo: ArtPieceInfo[] = [
  { slug: "the-harvesters", isFavorite: true },
  { slug: "the-night-watch", isFavorite: false },
];

test("isFavorite is true only for favorite art pieces", () => {
  expect(isFavorite(artPiecesInfo, "the-harvesters")).toBe(true);
  expect(isFavorite(artPiecesInfo, "the-night-watch")).toBe(false);
  expect(isFavorite(artPiecesInfo, "unknown-slug")).toBe(false);
});

test("toggleFavorite adds an art piece without info as favorite", () => {
  expect(toggleFavorite(artPiecesInfo, "mona-lisa")).toEqual([
    ...artPiecesInfo,
    { slug: "mona-lisa", isFavorite: true },
  ]);
});

test("toggleFavorite flips the favorite status of an existing entry", () => {
  const updated = toggleFavorite(artPiecesInfo, "the-harvesters");

  expect(isFavorite(updated, "the-harvesters")).toBe(false);
  expect(
    isFavorite(toggleFavorite(updated, "the-harvesters"), "the-harvesters")
  ).toBe(true);
  expect(
    isFavorite(
      toggleFavorite(artPiecesInfo, "the-night-watch"),
      "the-night-watch"
    )
  ).toBe(true);
});

test("toggleFavorite does not change the original list", () => {
  const original = structuredClone(artPiecesInfo);

  toggleFavorite(artPiecesInfo, "the-harvesters");
  toggleFavorite(artPiecesInfo, "mona-lisa");

  expect(artPiecesInfo).toEqual(original);
});

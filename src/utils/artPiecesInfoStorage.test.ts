import type { ArtPieceInfo } from "../types";
import {
  loadArtPiecesInfo,
  saveArtPiecesInfo,
  STORAGE_KEY,
} from "./artPiecesInfoStorage";

const artPiecesInfo: ArtPieceInfo[] = [
  {
    slug: "the-harvesters",
    isFavorite: true,
    comments: [
      { id: "1", text: "Golden fields", date: "2026-11-10T12:00:00.000Z" },
    ],
  },
];

test("returns an empty list when nothing is stored", () => {
  expect(loadArtPiecesInfo()).toEqual([]);
});

test("returns an empty list when the stored value is broken", () => {
  localStorage.setItem(STORAGE_KEY, "{not json");

  expect(loadArtPiecesInfo()).toEqual([]);
});

test("returns the saved information", () => {
  saveArtPiecesInfo(artPiecesInfo);

  expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(artPiecesInfo));
  expect(loadArtPiecesInfo()).toEqual(artPiecesInfo);
});

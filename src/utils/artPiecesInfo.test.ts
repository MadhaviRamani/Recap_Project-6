import type { ArtPieceInfo } from "../types";
import {
  addComment,
  deleteComment,
  editComment,
  getComments,
  isFavorite,
  toggleFavorite,
} from "./artPiecesInfo";

const artPiecesInfo: ArtPieceInfo[] = [
  { slug: "the-harvesters", isFavorite: true, comments: [] },
  { slug: "the-night-watch", isFavorite: false, comments: [] },
];

test("isFavorite is true only for favorite art pieces", () => {
  expect(isFavorite(artPiecesInfo, "the-harvesters")).toBe(true);
  expect(isFavorite(artPiecesInfo, "the-night-watch")).toBe(false);
  expect(isFavorite(artPiecesInfo, "unknown-slug")).toBe(false);
});

test("toggleFavorite adds an art piece without info as favorite", () => {
  expect(toggleFavorite(artPiecesInfo, "mona-lisa")).toEqual([
    ...artPiecesInfo,
    { slug: "mona-lisa", isFavorite: true, comments: [] },
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

const comment = {
  id: "1",
  text: "Golden fields",
  date: "2026-11-09T10:00:00.000Z",
};

test("getComments returns the comments of the slug or an empty list", () => {
  const withComment = addComment(artPiecesInfo, "the-harvesters", comment);

  expect(getComments(withComment, "the-harvesters")).toEqual([comment]);
  expect(getComments(withComment, "the-night-watch")).toEqual([]);
  expect(getComments(withComment, "unknown-slug")).toEqual([]);
});

test("addComment adds the comment only to this art piece", () => {
  const updated = addComment(artPiecesInfo, "the-harvesters", comment);

  expect(updated).toEqual([
    { slug: "the-harvesters", isFavorite: true, comments: [comment] },
    { slug: "the-night-watch", isFavorite: false, comments: [] },
  ]);
});

test("addComment adds an entry for an art piece without info", () => {
  expect(addComment(artPiecesInfo, "mona-lisa", comment)).toEqual([
    ...artPiecesInfo,
    { slug: "mona-lisa", isFavorite: false, comments: [comment] },
  ]);
});

test("editComment changes only the text of the comment with the id", () => {
  const other = { ...comment, id: "2", text: "Other" };
  const withComments = addComment(
    addComment(artPiecesInfo, "the-harvesters", comment),
    "the-harvesters",
    other
  );

  expect(
    getComments(
      editComment(withComments, "the-harvesters", "1", "Changed"),
      "the-harvesters"
    )
  ).toEqual([{ ...comment, text: "Changed" }, other]);
});

test("deleteComment removes only the comment with the id", () => {
  const other = { ...comment, id: "2", text: "Other" };
  const withComments = addComment(
    addComment(artPiecesInfo, "the-harvesters", comment),
    "the-harvesters",
    other
  );

  expect(
    getComments(
      deleteComment(withComments, "the-harvesters", "1"),
      "the-harvesters"
    )
  ).toEqual([other]);
});

test("the comment functions do not change the original list", () => {
  const original = structuredClone(artPiecesInfo);
  const withComment = addComment(artPiecesInfo, "the-harvesters", comment);
  const withCommentCopy = structuredClone(withComment);

  editComment(withComment, "the-harvesters", "1", "Changed");
  deleteComment(withComment, "the-harvesters", "1");

  expect(artPiecesInfo).toEqual(original);
  expect(withComment).toEqual(withCommentCopy);
});

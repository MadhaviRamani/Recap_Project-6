import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";

import type { ArtPiece, ArtPieceInfo } from "../types";
import Profile from "./Profile";

const artPieces: ArtPiece[] = [
  {
    slug: "wheat-field-with-cypresses",
    year: "1889",
    genre: "Landscape Painting",
    artist: "Vincent van Gogh",
    name: "Wheat Field with Cypresses",
    imageSource: "https://example.com/wheat-field.jpg",
    colors: ["#37412E"],
  },
  {
    slug: "the-harvesters",
    year: "1565",
    genre: "Genre Painting",
    artist: "Pieter Bruegel the Elder",
    name: "The Harvesters",
    imageSource: "https://example.com/the-harvesters.jpg",
    colors: ["#4D3C25"],
  },
  {
    slug: "the-night-watch",
    year: "1642",
    genre: "Portrait",
    artist: "Rembrandt",
    name: "The Night Watch",
    imageSource: "https://example.com/the-night-watch.jpg",
    colors: ["#2B2A1F"],
  },
];

const artPiecesInfo: ArtPieceInfo[] = [
  { slug: "the-harvesters", isFavorite: true, comments: [] },
  { slug: "the-night-watch", isFavorite: true, comments: [] },
  { slug: "wheat-field-with-cypresses", isFavorite: false, comments: [] },
];

function renderProfile(props: Partial<ComponentProps<typeof Profile>> = {}) {
  const onChangeProfileName = vi.fn();
  render(
    <Profile
      profileName="Art Lover"
      artPieces={artPieces}
      artPiecesInfo={artPiecesInfo}
      onChangeProfileName={onChangeProfileName}
      {...props}
    />
  );
  return { onChangeProfileName };
}

test("shows the profile name", () => {
  renderProfile();

  expect(
    screen.getByRole("heading", { name: "Art Lover" })
  ).toBeInTheDocument();
});

test("shows the number of art pieces and favorites", () => {
  renderProfile();

  expect(screen.getByText("Art pieces: 3")).toBeInTheDocument();
  expect(screen.getByText("Favorites: 2")).toBeInTheDocument();
});

test("shows zero favorites without any art piece info", () => {
  renderProfile({ artPiecesInfo: [] });

  expect(screen.getByText("Favorites: 0")).toBeInTheDocument();
});

test("counts only favorites whose art piece exists", () => {
  renderProfile({
    artPiecesInfo: [
      ...artPiecesInfo,
      { slug: "removed-art-piece", isFavorite: true, comments: [] },
    ],
  });

  expect(screen.getByText("Favorites: 2")).toBeInTheDocument();
});

test("Edit name shows a text input with the current name", async () => {
  const user = userEvent.setup();
  renderProfile();

  await user.click(screen.getByRole("button", { name: "Edit name" }));

  expect(screen.getByLabelText("Profile name")).toHaveValue("Art Lover");
});

test("saving a new name calls the handler with the trimmed name", async () => {
  const user = userEvent.setup();
  const { onChangeProfileName } = renderProfile();

  await user.click(screen.getByRole("button", { name: "Edit name" }));
  const input = screen.getByLabelText("Profile name");
  await user.clear(input);
  await user.type(input, "  Ada  ");
  await user.click(screen.getByRole("button", { name: "Save" }));

  expect(onChangeProfileName).toHaveBeenCalledWith("Ada");
  expect(screen.queryByLabelText("Profile name")).not.toBeInTheDocument();
});

test("an empty name cannot be saved", async () => {
  const user = userEvent.setup();
  const { onChangeProfileName } = renderProfile();

  await user.click(screen.getByRole("button", { name: "Edit name" }));
  const input = screen.getByLabelText("Profile name");
  await user.clear(input);
  await user.type(input, "   {Enter}");

  expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  expect(onChangeProfileName).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Profile name")).toBeInTheDocument();
});

test("submitting the form with only spaces does not save the name", async () => {
  const user = userEvent.setup();
  const { onChangeProfileName } = renderProfile();

  await user.click(screen.getByRole("button", { name: "Edit name" }));
  const input = screen.getByLabelText("Profile name");
  await user.clear(input);
  await user.type(input, "   ");
  // submits even though the Save button is disabled
  fireEvent.submit(input.closest("form") as HTMLFormElement);

  expect(onChangeProfileName).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Profile name")).toBeInTheDocument();
});

test("Cancel keeps the old name", async () => {
  const user = userEvent.setup();
  const { onChangeProfileName } = renderProfile();

  await user.click(screen.getByRole("button", { name: "Edit name" }));
  await user.type(screen.getByLabelText("Profile name"), " Fan");
  await user.click(screen.getByRole("button", { name: "Cancel" }));

  expect(onChangeProfileName).not.toHaveBeenCalled();
  expect(
    screen.getByRole("heading", { name: "Art Lover" })
  ).toBeInTheDocument();
});

test("does not change the art pieces or the art piece info", () => {
  const artPiecesCopy = structuredClone(artPieces);
  const artPiecesInfoCopy = structuredClone(artPiecesInfo);

  renderProfile();

  expect(artPieces).toEqual(artPiecesCopy);
  expect(artPiecesInfo).toEqual(artPiecesInfoCopy);
});

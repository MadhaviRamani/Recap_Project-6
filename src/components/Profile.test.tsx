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
  const onToggleDarkMode = vi.fn();
  render(
    <Profile
      profileName="Art Lover"
      artPieces={artPieces}
      artPiecesInfo={artPiecesInfo}
      onChangeProfileName={onChangeProfileName}
      isDarkMode={false}
      onToggleDarkMode={onToggleDarkMode}
      {...props}
    />
  );
  return { onChangeProfileName, onToggleDarkMode };
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

test("shows a Settings section below the profile information", () => {
  renderProfile();

  const settingsHeading = screen.getByRole("heading", { name: "Settings" });
  const favorites = screen.getByText("Favorites: 2");
  expect(
    favorites.compareDocumentPosition(settingsHeading) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});

test("the Dark mode switch is off when dark mode is off", () => {
  renderProfile({ isDarkMode: false });

  const toggle = screen.getByRole("switch", { name: "Dark mode" });
  expect(toggle).toHaveAttribute("aria-checked", "false");
  expect(toggle).toHaveTextContent("Off");
});

test("the Dark mode switch is on when dark mode is on", () => {
  renderProfile({ isDarkMode: true });

  const toggle = screen.getByRole("switch", { name: "Dark mode" });
  expect(toggle).toHaveAttribute("aria-checked", "true");
  expect(toggle).toHaveTextContent("On");
});

test("clicking the Dark mode switch calls the toggle handler", async () => {
  const user = userEvent.setup();
  const { onToggleDarkMode } = renderProfile();

  await user.click(screen.getByRole("switch", { name: "Dark mode" }));

  expect(onToggleDarkMode).toHaveBeenCalledTimes(1);
});

test("the office shows the name on a brass nameplate and the counts on two plaques", () => {
  renderProfile();

  const nameplate = document.querySelector(".office-nameplate");
  expect(nameplate).toContainElement(
    screen.getByRole("heading", { name: "Art Lover" })
  );
  const plaques = document.querySelectorAll(".office-plaque");
  expect(plaques).toHaveLength(2);
  // the big number and the label are for the eyes, the hidden text for
  // screen readers
  expect(plaques[0]).toContainElement(screen.getByText("Art pieces: 3"));
  const count = plaques[0].querySelector(".office-plaque-count");
  expect(count).toHaveTextContent("3");
  expect(count).toHaveAttribute("aria-hidden", "true");
  expect(plaques[1]).toContainElement(screen.getByText("Favorites: 2"));
  expect(plaques[1].querySelector(".office-plaque-label")).toHaveTextContent(
    "Favorites"
  );
});

test("the settings sit in a glass panel of the office", () => {
  renderProfile();

  expect(
    screen.getByRole("heading", { name: "Settings" }).closest(".office-panel")
  ).not.toBeNull();
});

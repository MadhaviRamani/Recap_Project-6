import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

import type { ArtPiece, ArtPieceInfo } from "../types";
import ArtPieceDetails from "./ArtPieceDetails";

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

// renders the details on their dynamic route, next to a stand-in list route
function renderDetails(
  route: string,
  artPiecesInfo: ArtPieceInfo[] = [],
  onToggleFavorite = vi.fn(),
  commentHandlers = {
    onAddComment: vi.fn(),
    onEditComment: vi.fn(),
    onDeleteComment: vi.fn(),
  }
) {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/art-pieces" element={<h1>Gallery list</h1>} />
        <Route
          path="/art-pieces/:slug"
          element={
            <ArtPieceDetails
              artPieces={artPieces}
              artPiecesInfo={artPiecesInfo}
              onToggleFavorite={onToggleFavorite}
              {...commentHandlers}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

test("shows the image of the art piece from the URL", () => {
  renderDetails("/art-pieces/the-harvesters");

  expect(
    screen.getByRole("img", {
      name: "The Harvesters by Pieter Bruegel the Elder",
    })
  ).toHaveAttribute("src", "https://example.com/the-harvesters.jpg");
});

test("shows the title of the art piece", () => {
  renderDetails("/art-pieces/the-harvesters");

  expect(
    screen.getByRole("heading", { level: 1, name: "The Harvesters" })
  ).toBeInTheDocument();
});

test("shows the artist, year and genre of the art piece", () => {
  renderDetails("/art-pieces/the-harvesters");

  expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
  expect(screen.getByText("1565")).toBeInTheDocument();
  expect(screen.getByText("Genre Painting")).toBeInTheDocument();
});

test("shows a back button", () => {
  renderDetails("/art-pieces/the-harvesters");

  expect(
    screen.getByRole("button", { name: "Back to gallery" })
  ).toBeInTheDocument();
});

test("clicking the back button navigates to the list view", async () => {
  const user = userEvent.setup();
  renderDetails("/art-pieces/the-harvesters");

  await user.click(screen.getByRole("button", { name: "Back to gallery" }));

  expect(
    screen.getByRole("heading", { name: "Gallery list" })
  ).toBeInTheDocument();
});

test("shows Art piece not found for an unknown slug", async () => {
  const user = userEvent.setup();
  renderDetails("/art-pieces/does-not-exist");

  expect(
    screen.getByRole("heading", { name: "Art piece not found" })
  ).toBeInTheDocument();

  // the way back to the list also works here
  await user.click(screen.getByRole("button", { name: "Back to gallery" }));
  expect(
    screen.getByRole("heading", { name: "Gallery list" })
  ).toBeInTheDocument();
});

test("shows the favorite button with the favorite status", () => {
  renderDetails("/art-pieces/the-harvesters", [
    { slug: "the-harvesters", isFavorite: true, comments: [] },
  ]);

  expect(screen.getByRole("button", { name: "Favorite" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});

test("clicking the favorite button toggles the favorite of this art piece", async () => {
  const user = userEvent.setup();
  const onToggleFavorite = vi.fn();
  renderDetails("/art-pieces/the-harvesters", [], onToggleFavorite);

  await user.click(screen.getByRole("button", { name: "Favorite" }));

  expect(onToggleFavorite).toHaveBeenCalledWith("the-harvesters");
});

test("shows the comments of this art piece only", () => {
  renderDetails("/art-pieces/the-harvesters", [
    {
      slug: "the-harvesters",
      isFavorite: false,
      comments: [
        { id: "1", text: "Golden fields", date: "2026-11-09T10:00:00.000Z" },
      ],
    },
    {
      slug: "wheat-field-with-cypresses",
      isFavorite: false,
      comments: [
        { id: "2", text: "Swirling sky", date: "2026-11-09T11:00:00.000Z" },
      ],
    },
  ]);

  expect(screen.getByRole("heading", { name: "Comments" })).toBeInTheDocument();
  expect(screen.getByText("Golden fields")).toBeInTheDocument();
  expect(screen.queryByText("Swirling sky")).not.toBeInTheDocument();
});

test("the comment handlers receive the slug of this art piece", async () => {
  const user = userEvent.setup();
  const commentHandlers = {
    onAddComment: vi.fn(),
    onEditComment: vi.fn(),
    onDeleteComment: vi.fn(),
  };
  renderDetails(
    "/art-pieces/the-harvesters",
    [
      {
        slug: "the-harvesters",
        isFavorite: false,
        comments: [
          { id: "1", text: "Golden fields", date: "2026-11-09T10:00:00.000Z" },
        ],
      },
    ],
    vi.fn(),
    commentHandlers
  );

  await user.type(screen.getByLabelText("Add comment"), "Lovely");
  await user.click(screen.getByRole("button", { name: "Send" }));
  expect(commentHandlers.onAddComment).toHaveBeenCalledWith(
    "the-harvesters",
    "Lovely"
  );

  await user.click(screen.getByRole("button", { name: "Edit" }));
  await user.type(screen.getByLabelText("Edit comment"), "!");
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(commentHandlers.onEditComment).toHaveBeenCalledWith(
    "the-harvesters",
    "1",
    "Golden fields!"
  );

  await user.click(screen.getByRole("button", { name: "Delete" }));
  expect(commentHandlers.onDeleteComment).toHaveBeenCalledWith(
    "the-harvesters",
    "1"
  );
});

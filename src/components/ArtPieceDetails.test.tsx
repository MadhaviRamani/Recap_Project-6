import { render, screen, within } from "@testing-library/react";
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
    colors: ["#37412E", "#8D7332", "#838665", "#718F98", "#9DA59E"],
  },
  {
    slug: "the-harvesters",
    year: "1565",
    genre: "Genre Painting",
    artist: "Pieter Bruegel the Elder",
    name: "The Harvesters",
    imageSource: "https://example.com/the-harvesters.jpg",
    colors: ["#4D3C25", "#9A692E", "#7C8263", "#B78D53", "#C7B7A4"],
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

test("shows the color palette of the art piece from the URL", () => {
  renderDetails("/art-pieces/the-harvesters");

  const palette = screen.getByRole("heading", { name: "Color palette" })
    .nextElementSibling as HTMLElement;
  const items = within(palette).getAllByRole("listitem");

  expect(items).toHaveLength(5);
  expect(
    within(palette)
      .getByRole("button", { name: "Copy color #4D3C25" })
      .closest("li")
  ).toHaveStyle({ backgroundColor: "#4D3C25" });
  expect(
    within(palette).queryByRole("button", { name: "Copy color #37412E" })
  ).not.toBeInTheDocument();
});

test("Similar in the palette finds other art pieces with a similar color", async () => {
  const user = userEvent.setup();
  renderDetails("/art-pieces/the-harvesters");

  // #9A692E of The Harvesters is close to #8D7332 of the Wheat Field
  await user.click(
    screen.getByRole("button", {
      name: "Find art pieces with a color similar to #9A692E",
    })
  );

  expect(
    screen.getByRole("link", { name: /Wheat Field with Cypresses/ })
  ).toHaveAttribute("href", "/art-pieces/wheat-field-with-cypresses");
});

test("opening a similar art piece shows its own palette without old results", async () => {
  const user = userEvent.setup();
  renderDetails("/art-pieces/the-harvesters");
  await user.click(
    screen.getByRole("button", {
      name: "Find art pieces with a color similar to #9A692E",
    })
  );

  await user.click(
    screen.getByRole("link", { name: /Wheat Field with Cypresses/ })
  );

  expect(
    screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Copy color #37412E" })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: /Art pieces with a color similar/ })
  ).not.toBeInTheDocument();
});

describe("viewing room", () => {
  function getRoom() {
    return document.querySelector(".details-room");
  }

  test("hangs the image in the golden frame, with the favorite button on it", () => {
    renderDetails("/art-pieces/the-harvesters");

    const artwork = getRoom()?.querySelector(".details-artwork");
    const frame = artwork?.querySelector(".details-frame");
    expect(frame).toContainElement(
      screen.getByRole("img", {
        name: "The Harvesters by Pieter Bruegel the Elder",
      })
    );
    expect(frame).toContainElement(
      screen.getByRole("button", { name: "Favorite" })
    );
  });

  test("hangs the frame under a decorative lamp and its light", () => {
    renderDetails("/art-pieces/the-harvesters");

    const artwork = getRoom()?.querySelector(".details-artwork");
    for (const decoration of artwork?.querySelectorAll(
      ".details-lamp, .details-light"
    ) ?? []) {
      expect(decoration).toHaveAttribute("aria-hidden", "true");
      expect(decoration).toBeEmptyDOMElement();
    }
    expect(artwork?.querySelectorAll(".details-lamp")).toHaveLength(1);
    expect(artwork?.querySelectorAll(".details-light")).toHaveLength(1);
  });

  test("the placard shows the name, the artist, the year and the genre", () => {
    renderDetails("/art-pieces/the-harvesters");

    const placard = getRoom()?.querySelector(".details-placard");
    expect(placard).not.toBeNull();
    const inPlacard = within(placard as HTMLElement);
    expect(
      inPlacard.getByRole("heading", { level: 1, name: "The Harvesters" })
    ).toBeInTheDocument();
    expect(inPlacard.getByText("Pieter Bruegel the Elder")).toHaveClass(
      "details-artist"
    );
    expect(inPlacard.getByText("Year")).toBeInTheDocument();
    expect(inPlacard.getByText("1565")).toBeInTheDocument();
    expect(inPlacard.getByText("Genre")).toBeInTheDocument();
    expect(inPlacard.getByText("Genre Painting")).toBeInTheDocument();
  });

  test("the palette and the guest book lie in their glass panels", () => {
    renderDetails("/art-pieces/the-harvesters");

    const panels = getRoom()?.querySelectorAll(".details-panel") ?? [];
    expect(panels).toHaveLength(2);
    expect(panels[0]).toContainElement(
      screen.getByRole("heading", { name: "Color palette" })
    );
    expect(panels[1]).toHaveClass("details-guestbook");
    expect(panels[1]).toContainElement(
      screen.getByRole("heading", { name: "Comments" })
    );
    expect(panels[1]).toContainElement(screen.getByLabelText("Add comment"));
  });

  test("the back button comes last, under the guest book; the arrow is decoration", () => {
    renderDetails("/art-pieces/the-harvesters");

    const back = screen.getByRole("button", { name: "Back to gallery" });
    expect(getRoom()?.lastElementChild).toBe(back);
    expect(
      getRoom()
        ?.querySelector(".details-guestbook")
        ?.compareDocumentPosition(back)
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(back.querySelector('[aria-hidden="true"]')).toHaveTextContent("←");
  });

  test("Art piece not found is shown in the room", () => {
    renderDetails("/art-pieces/unknown");

    expect(getRoom()).toContainElement(
      screen.getByRole("heading", { name: "Art piece not found" })
    );
    expect(getRoom()?.querySelector(".details-artwork")).toBeNull();
  });
});

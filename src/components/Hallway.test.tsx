import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

import type { ArtPiece, ArtPieceInfo } from "../types";
import Hallway from "./Hallway";

function createArtPieces(count: number): ArtPiece[] {
  return Array.from({ length: count }, (_, index) => ({
    slug: `art-piece-${index + 1}`,
    year: "1900",
    genre: "Painting",
    artist: `Artist ${index + 1}`,
    name: `Art Piece ${index + 1}`,
    imageSource: `https://example.com/art-piece-${index + 1}.jpg`,
    colors: ["#000000"],
  }));
}

function renderHallway(
  artPieces: ArtPiece[],
  artPiecesInfo: ArtPieceInfo[] = [],
  onToggleFavorite = vi.fn()
) {
  // the previews contain Links, which need a router
  return render(
    <MemoryRouter>
      <Hallway
        artPieces={artPieces}
        artPiecesInfo={artPiecesInfo}
        onToggleFavorite={onToggleFavorite}
      />
    </MemoryRouter>
  );
}

function headingsOnWall(name: string): string[] {
  return within(screen.getByRole("list", { name }))
    .getAllByRole("heading")
    .map((heading) => heading.textContent ?? "");
}

test("hangs 5 art pieces on the left, 5 on the right and 1 on the front wall", () => {
  renderHallway(createArtPieces(11));

  expect(headingsOnWall("Left wall")).toEqual([
    "Art Piece 1",
    "Art Piece 2",
    "Art Piece 3",
    "Art Piece 4",
    "Art Piece 5",
  ]);
  expect(headingsOnWall("Right wall")).toEqual([
    "Art Piece 6",
    "Art Piece 7",
    "Art Piece 8",
    "Art Piece 9",
    "Art Piece 10",
  ]);
  expect(headingsOnWall("Front wall")).toEqual(["Art Piece 11"]);
});

test("fills the left wall first when there are fewer art pieces", () => {
  renderHallway(createArtPieces(3));

  expect(headingsOnWall("Left wall")).toHaveLength(3);
  expect(
    screen.queryByRole("list", { name: "Right wall" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("list", { name: "Front wall" })
  ).not.toBeInTheDocument();
});

test("links every art piece to its details page with its alt text", () => {
  renderHallway(createArtPieces(11));

  const image = screen.getByAltText("Art Piece 11 by Artist 11");
  expect(image).toHaveAttribute("src", "https://example.com/art-piece-11.jpg");
  expect(image.closest("a")).toHaveAttribute(
    "href",
    "/art-pieces/art-piece-11"
  );
  expect(screen.getAllByRole("link")).toHaveLength(11);
  expect(screen.getByText("Artist 7")).toBeInTheDocument();
});

test("hangs every art piece under a decorative lamp and its light", () => {
  const { container } = renderHallway(createArtPieces(11));

  const lamps = container.querySelectorAll(".hallway-lamp");
  const lights = container.querySelectorAll(".hallway-light");
  expect(lamps).toHaveLength(11);
  expect(lights).toHaveLength(11);
  for (const decoration of [...lamps, ...lights]) {
    expect(decoration).toHaveAttribute("aria-hidden", "true");
    expect(decoration).toBeEmptyDOMElement();
  }
  for (const room of container.querySelectorAll(
    ".hallway-floor, .hallway-ceiling"
  )) {
    expect(room).toHaveAttribute("aria-hidden", "true");
  }
});

test("shows the favorites and toggles the favorite of an art piece", async () => {
  const user = userEvent.setup();
  const handleToggleFavorite = vi.fn();
  renderHallway(
    createArtPieces(11),
    [{ slug: "art-piece-6", isFavorite: true, comments: [] }],
    handleToggleFavorite
  );

  const rightWall = screen.getByRole("list", { name: "Right wall" });
  const buttons = within(rightWall).getAllByRole("button", {
    name: "Favorite",
  });
  expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
  expect(buttons[1]).toHaveAttribute("aria-pressed", "false");

  await user.click(
    within(screen.getByRole("list", { name: "Front wall" })).getByRole(
      "button",
      { name: "Favorite" }
    )
  );

  expect(handleToggleFavorite).toHaveBeenCalledTimes(1);
  expect(handleToggleFavorite).toHaveBeenCalledWith("art-piece-11");
});

test("gives every art piece on a wall its place, counted from the near end", () => {
  renderHallway(createArtPieces(11));

  for (const name of ["Left wall", "Right wall"]) {
    const items = within(screen.getByRole("list", { name })).getAllByRole(
      "listitem"
    );
    expect(
      items.map((item) => item.style.getPropertyValue("--hallway-place"))
    ).toEqual(["1", "2", "3", "4", "5"]);
  }
  const frontItem = within(
    screen.getByRole("list", { name: "Front wall" })
  ).getByRole("listitem");
  expect(frontItem.style.getPropertyValue("--hallway-place")).toBe("1");
});

test("the lamp, its light and the art piece turn together, the list item stays", () => {
  const { container } = renderHallway(createArtPieces(11));

  const items = container.querySelectorAll(".hallway-item");
  expect(items).toHaveLength(11);
  for (const item of items) {
    const art = item.querySelector(":scope > .hallway-item-art");
    expect(art).not.toBeNull();
    expect(art?.querySelector(".hallway-lamp")).not.toBeNull();
    expect(art?.querySelector(".hallway-light")).not.toBeNull();
    expect(art?.querySelector(".art-piece")).not.toBeNull();
  }
});

describe("hover and keyboard", () => {
  function getWallLink(number: number) {
    return screen
      .getByAltText(`Art Piece ${number} by Artist ${number}`)
      .closest("a");
  }

  test("hovering an art piece opens no front view", async () => {
    const user = userEvent.setup();
    renderHallway(createArtPieces(11));

    await user.hover(screen.getByAltText("Art Piece 7 by Artist 7"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // the art piece is shown once, on its wall
    expect(screen.getAllByAltText("Art Piece 7 by Artist 7")).toHaveLength(1);
  });

  test("focusing an art piece with the keyboard opens no front view", async () => {
    const user = userEvent.setup();
    renderHallway(createArtPieces(11));

    await user.tab();

    expect(getWallLink(1)).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("Tab goes from an art piece to its favorite button and on to the next art piece", async () => {
    const user = userEvent.setup();
    renderHallway(createArtPieces(11));
    const leftWall = screen.getByRole("list", { name: "Left wall" });

    await user.tab();
    expect(getWallLink(1)).toHaveFocus();

    await user.tab();
    expect(
      within(leftWall).getAllByRole("button", { name: "Favorite" })[0]
    ).toHaveFocus();

    await user.tab();
    expect(getWallLink(2)).toHaveFocus();
  });
});

test.each([
  ["Left wall", 2],
  ["Right wall", 8],
  ["Front wall", 11],
])(
  "clicking an art piece on the %s opens its details page",
  async (_wall, number) => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/art-pieces"]}>
        <Routes>
          <Route
            path="/art-pieces"
            element={
              <Hallway
                artPieces={createArtPieces(11)}
                artPiecesInfo={[]}
                onToggleFavorite={vi.fn()}
              />
            }
          />
          <Route path="/art-pieces/:slug" element={<h1>Details page</h1>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(
      screen.getByAltText(`Art Piece ${number} by Artist ${number}`)
    );

    expect(
      screen.getByRole("heading", { name: "Details page" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Left wall" })).toBeNull();
  }
);

describe("empty frames", () => {
  function renderWithFilled(filledSlugs: string[]) {
    return render(
      <MemoryRouter>
        <Hallway
          artPieces={createArtPieces(11)}
          artPiecesInfo={[]}
          onToggleFavorite={vi.fn()}
          filledSlugs={filledSlugs}
        />
      </MemoryRouter>
    );
  }

  test("only the filled art pieces show their image, link and favorite button", () => {
    const { container } = renderWithFilled(["art-piece-3", "art-piece-11"]);

    expect(screen.getAllByRole("listitem")).toHaveLength(11);
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Favorite" })).toHaveLength(2);
    expect(
      screen.getByAltText("Art Piece 3 by Artist 3").closest("a")
    ).toHaveAttribute("href", "/art-pieces/art-piece-3");
    expect(
      screen.getByAltText("Art Piece 11 by Artist 11")
    ).toBeInTheDocument();
    expect(screen.queryByText("Art Piece 1")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".hallway-item-empty")).toHaveLength(9);
  });

  test("every other art piece hangs as an empty frame in its own place", () => {
    renderWithFilled(["art-piece-3"]);

    const leftWall = within(screen.getByRole("list", { name: "Left wall" }));
    const items = leftWall.getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(
      within(items[2]).getByAltText("Art Piece 3 by Artist 3")
    ).toBeInTheDocument();
    for (const index of [0, 1, 3, 4]) {
      expect(items[index]).toHaveClass("hallway-item-empty");
      expect(
        within(items[index]).getByRole("img", { name: "Empty frame" })
      ).toBeInTheDocument();
      expect(within(items[index]).queryByRole("link")).not.toBeInTheDocument();
    }
    expect(screen.getAllByRole("img", { name: "Empty frame" })).toHaveLength(
      10
    );
  });

  test("the keyboard skips the empty frames", async () => {
    const user = userEvent.setup();
    renderWithFilled(["art-piece-2", "art-piece-9"]);

    await user.tab();
    expect(
      screen.getByAltText("Art Piece 2 by Artist 2").closest("a")
    ).toHaveFocus();
    await user.tab(); // its favorite button
    await user.tab();
    expect(
      screen.getByAltText("Art Piece 9 by Artist 9").closest("a")
    ).toHaveFocus();
  });

  test("without filled art pieces, every frame is empty", () => {
    renderWithFilled([]);

    expect(screen.getAllByRole("img", { name: "Empty frame" })).toHaveLength(
      11
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("without filledSlugs, no frame is empty", () => {
    renderHallway(createArtPieces(11));

    expect(
      screen.queryByRole("img", { name: "Empty frame" })
    ).not.toBeInTheDocument();
  });
});

describe("runway", () => {
  test("shows its content in the hallway, before the art pieces", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <Hallway
          artPieces={createArtPieces(2)}
          artPiecesInfo={[]}
          onToggleFavorite={vi.fn()}
          runway={<button type="button">On the runway</button>}
        />
      </MemoryRouter>
    );

    const runwayButton = screen.getByRole("button", { name: "On the runway" });
    expect(container.querySelector(".hallway-runway")).toContainElement(
      runwayButton
    );

    // the keyboard reaches the runway first
    await user.tab();
    expect(runwayButton).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("has no runway without content", () => {
    const { container } = renderHallway(createArtPieces(2));

    expect(container.querySelector(".hallway-runway")).not.toBeInTheDocument();
  });
});

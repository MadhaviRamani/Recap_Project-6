import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { ArtPiece, ArtPieceInfo } from "../types";
import Hallway, { FRONT_VIEW_CLOSE_DELAY } from "./Hallway";

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

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

describe("front view", () => {
  // while the front view is open, its image is in the page twice;
  // the one on the wall comes first
  function getWallItemImage(number: number) {
    return screen.getAllByAltText(`Art Piece ${number} by Artist ${number}`)[0];
  }

  test("hovering an art piece brings it to the front with all its details", async () => {
    const user = userEvent.setup();
    renderHallway(createArtPieces(11));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.hover(getWallItemImage(7));

    const frontView = screen.getByRole("dialog", { name: "Art Piece 7" });
    expect(within(frontView).getByText("Artist 7")).toBeInTheDocument();
    expect(within(frontView).getByText("1900")).toBeInTheDocument();
    expect(within(frontView).getByText("Painting")).toBeInTheDocument();
    expect(
      within(frontView).getByRole("link", { name: "View details" })
    ).toHaveAttribute("href", "/art-pieces/art-piece-7");
  });

  test("closes when the mouse leaves the art piece", async () => {
    const user = userEvent.setup();
    renderHallway(createArtPieces(11));

    await user.hover(getWallItemImage(1));
    await user.unhover(getWallItemImage(1));

    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  });

  test("stays open while the mouse is on the front view", async () => {
    const user = userEvent.setup();
    renderHallway(createArtPieces(11));

    await user.hover(getWallItemImage(3));
    const frontView = screen.getByRole("dialog", { name: "Art Piece 3" });
    await user.hover(frontView);
    await wait(FRONT_VIEW_CLOSE_DELAY * 2);

    expect(frontView).toBeInTheDocument();

    await user.unhover(frontView);
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  });

  test("shows only the art piece hovered last", async () => {
    const user = userEvent.setup();
    renderHallway(createArtPieces(11));

    await user.hover(getWallItemImage(2));
    await user.hover(getWallItemImage(11));

    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(
      screen.getByRole("dialog", { name: "Art Piece 11" })
    ).toBeInTheDocument();
  });

  test("the favorite button in the front view toggles the favorite", async () => {
    const user = userEvent.setup();
    const handleToggleFavorite = vi.fn();
    renderHallway(
      createArtPieces(11),
      [{ slug: "art-piece-4", isFavorite: true, comments: [] }],
      handleToggleFavorite
    );

    await user.hover(getWallItemImage(4));
    const frontView = screen.getByRole("dialog", { name: "Art Piece 4" });
    const button = within(frontView).getByRole("button", { name: "Favorite" });
    expect(button).toHaveAttribute("aria-pressed", "true");

    await user.click(button);

    expect(handleToggleFavorite).toHaveBeenCalledTimes(1);
    expect(handleToggleFavorite).toHaveBeenCalledWith("art-piece-4");
  });

  test("Escape closes the front view", async () => {
    const user = userEvent.setup();
    renderHallway(createArtPieces(11));

    await user.hover(getWallItemImage(5));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("a tap on a touch screen does not open the front view", async () => {
    const user = userEvent.setup();
    renderHallway(createArtPieces(11));

    await user.pointer({ keys: "[TouchA]", target: getWallItemImage(1) });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("keyboard", () => {
    function getWallLink(number: number) {
      return getWallItemImage(number).closest("a");
    }

    test("focusing an art piece brings it to the front", async () => {
      const user = userEvent.setup();
      renderHallway(createArtPieces(11));

      await user.tab();

      expect(getWallLink(1)).toHaveFocus();
      expect(
        screen.getByRole("dialog", { name: "Art Piece 1" })
      ).toBeInTheDocument();
    });

    test("Tab goes through the front view and on to the next art piece", async () => {
      const user = userEvent.setup();
      renderHallway(createArtPieces(11));
      await user.tab(); // the link of art piece 1 on the wall
      await user.tab(); // its favorite button on the wall

      await user.tab();
      const frontView = screen.getByRole("dialog", { name: "Art Piece 1" });
      expect(
        within(frontView).getByRole("button", { name: "Favorite" })
      ).toHaveFocus();

      await user.tab();
      expect(
        within(frontView).getByRole("link", { name: "View details" })
      ).toHaveFocus();

      await user.tab();
      expect(getWallLink(2)).toHaveFocus();
      expect(
        screen.getByRole("dialog", { name: "Art Piece 2" })
      ).toBeInTheDocument();
    });

    test("Shift+Tab goes from the front view back to the art piece", async () => {
      const user = userEvent.setup();
      renderHallway(createArtPieces(11));
      await user.tab();
      await user.tab();
      await user.tab(); // the favorite button in the front view

      await user.tab({ shift: true });

      const wallButton = within(
        screen.getByRole("list", { name: "Left wall" })
      ).getAllByRole("button", { name: "Favorite" })[0];
      expect(wallButton).toHaveFocus();
      expect(
        screen.getByRole("dialog", { name: "Art Piece 1" })
      ).toBeInTheDocument();
    });

    test("Tab after the last art piece leaves the hallway and closes the front view", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Hallway
            artPieces={createArtPieces(1)}
            artPiecesInfo={[]}
            onToggleFavorite={vi.fn()}
          />
          <button type="button">After the hallway</button>
        </MemoryRouter>
      );
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab(); // View details in the front view

      await user.tab();

      expect(
        screen.getByRole("button", { name: "After the hallway" })
      ).toHaveFocus();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    test("Escape closes the front view and focuses the art piece again", async () => {
      const user = userEvent.setup();
      renderHallway(createArtPieces(11));
      await user.tab();
      await user.tab();
      await user.tab(); // the favorite button in the front view

      await user.keyboard("{Escape}");

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(getWallLink(1)).toHaveFocus();
    });
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

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import ArtPieces from "./ArtPieces";

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

test("shows every art piece in a list", () => {
  // the previews contain Links, which need a router
  render(
    <MemoryRouter>
      <ArtPieces
        artPieces={artPieces}
        artPiecesInfo={[]}
        onToggleFavorite={vi.fn()}
      />
    </MemoryRouter>
  );

  expect(screen.getByRole("list")).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(
    screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "The Harvesters" })
  ).toBeInTheDocument();
});

test("shows a favorite button on each entry and highlights the favorites", () => {
  render(
    <MemoryRouter>
      <ArtPieces
        artPieces={artPieces}
        artPiecesInfo={[
          { slug: "the-harvesters", isFavorite: true, comments: [] },
        ]}
        onToggleFavorite={vi.fn()}
      />
    </MemoryRouter>
  );

  const buttons = screen.getAllByRole("button", { name: "Favorite" });
  expect(buttons).toHaveLength(2);
  expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
  expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
});

test("shows an empty list when there are no art pieces", () => {
  render(
    <MemoryRouter>
      <ArtPieces artPieces={[]} artPiecesInfo={[]} onToggleFavorite={vi.fn()} />
    </MemoryRouter>
  );

  expect(screen.getByRole("list")).toBeInTheDocument();
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
});

test("clicking a favorite button toggles the favorite of that art piece", async () => {
  const user = userEvent.setup();
  const handleToggleFavorite = vi.fn();
  render(
    <MemoryRouter>
      <ArtPieces
        artPieces={artPieces}
        artPiecesInfo={[]}
        onToggleFavorite={handleToggleFavorite}
      />
    </MemoryRouter>
  );

  const buttons = screen.getAllByRole("button", { name: "Favorite" });
  await user.click(buttons[1]);

  expect(handleToggleFavorite).toHaveBeenCalledTimes(1);
  expect(handleToggleFavorite).toHaveBeenCalledWith("the-harvesters");
});

describe("hallway", () => {
  test("the gallery hangs the art pieces in the hallway", () => {
    render(
      <MemoryRouter>
        <ArtPieces
          artPieces={artPieces}
          artPiecesInfo={[]}
          onToggleFavorite={vi.fn()}
          isHallway
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("list", { name: "Left wall" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  test("no search bar lies in the hallway, and no runway without a search", () => {
    const { container } = render(
      <MemoryRouter>
        <ArtPieces
          artPieces={artPieces}
          artPiecesInfo={[]}
          onToggleFavorite={vi.fn()}
          isHallway
        />
      </MemoryRouter>
    );

    expect(screen.queryByRole("search")).not.toBeInTheDocument();
    expect(container.querySelector(".hallway-runway")).not.toBeInTheDocument();
  });

  test("the favorites list is not a hallway", () => {
    render(
      <MemoryRouter>
        <ArtPieces
          artPieces={artPieces}
          artPiecesInfo={[]}
          onToggleFavorite={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(
      screen.queryByRole("list", { name: "Left wall" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("list")).toHaveClass("art-list");
  });
});

describe("search", () => {
  function renderSearchedArtPieces({
    isHallway = false,
    searchQuery = "",
    nationality = "",
    onShowAll = vi.fn(),
  }) {
    return render(
      <MemoryRouter>
        <ArtPieces
          artPieces={artPieces}
          artPiecesInfo={[]}
          onToggleFavorite={vi.fn()}
          isHallway={isHallway}
          searchQuery={searchQuery}
          nationality={nationality}
          onShowAll={onShowAll}
        />
      </MemoryRouter>
    );
  }

  describe.each([
    ["the gallery hallway", true],
    ["the favorites list", false],
  ])("in %s", (_, isHallway) => {
    test("shows only the art pieces matching the search text", () => {
      renderSearchedArtPieces({ isHallway, searchQuery: "van gogh" });

      expect(screen.getAllByRole("listitem")).toHaveLength(1);
      expect(
        screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
      ).toBeInTheDocument();
      expect(screen.getByText(/Results for “van gogh”/)).toBeInTheDocument();
    });

    test("shows only the art pieces of the nationality", () => {
      renderSearchedArtPieces({ isHallway, nationality: "Flemish" });

      expect(screen.getAllByRole("listitem")).toHaveLength(1);
      expect(
        screen.getByRole("heading", { name: "The Harvesters" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Results from Flemish artists/)
      ).toBeInTheDocument();
    });

    test("combines the search text with the nationality", () => {
      renderSearchedArtPieces({
        isHallway,
        searchQuery: "harvesters",
        nationality: "Dutch",
      });

      expect(
        screen.getByText(/Results for “harvesters” from Dutch artists/)
      ).toBeInTheDocument();
      expect(screen.getByText("No art pieces found")).toBeInTheDocument();
      expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    });

    test("Show all asks to show every art piece again", async () => {
      const user = userEvent.setup();
      const onShowAll = vi.fn();
      renderSearchedArtPieces({
        isHallway,
        searchQuery: "Harvesters",
        onShowAll,
      });

      await user.click(screen.getByRole("button", { name: "Show all" }));

      expect(onShowAll).toHaveBeenCalledTimes(1);
    });

    test("shows all art pieces and no status without a search", () => {
      renderSearchedArtPieces({ isHallway });

      expect(screen.getAllByRole("listitem")).toHaveLength(2);
      expect(screen.queryByText(/Results/)).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Show all" })
      ).not.toBeInTheDocument();
    });
  });

  test("the status lies on the runway of the hallway, even when nothing matches", () => {
    const { container } = renderSearchedArtPieces({
      isHallway: true,
      searchQuery: "sculpture",
    });

    const runway = container.querySelector(".hallway-runway");
    expect(runway).toContainElement(screen.getByText(/Results for/));
    expect(runway).toContainElement(screen.getByText("No art pieces found"));
    // the walls are empty
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  test("the status stands above the favorites list", () => {
    renderSearchedArtPieces({ searchQuery: "van gogh" });

    const status = screen.getByText(/Results for “van gogh”/);
    expect(
      status.compareDocumentPosition(screen.getByRole("list")) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});

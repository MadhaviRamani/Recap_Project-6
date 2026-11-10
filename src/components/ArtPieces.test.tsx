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

describe("search", () => {
  function renderSearchableArtPieces() {
    render(
      <MemoryRouter>
        <ArtPieces
          artPieces={artPieces}
          artPiecesInfo={[]}
          onToggleFavorite={vi.fn()}
          isSearchable
        />
      </MemoryRouter>
    );
    return userEvent.setup();
  }

  async function search(
    user: ReturnType<typeof userEvent.setup>,
    text: string
  ) {
    await user.type(
      screen.getByRole("searchbox", { name: "Search art pieces" }),
      text
    );
    await user.click(screen.getByRole("button", { name: "Search" }));
  }

  test("shows no search bar unless it is searchable", () => {
    render(
      <MemoryRouter>
        <ArtPieces
          artPieces={artPieces}
          artPiecesInfo={[]}
          onToggleFavorite={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.queryByRole("search")).not.toBeInTheDocument();
  });

  test("shows only the art pieces matching the search", async () => {
    const user = renderSearchableArtPieces();

    await search(user, "van gogh");

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Results for “van gogh”/)).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Search art pieces" })
    ).toHaveValue("");
  });

  test("Show all shows every art piece again", async () => {
    const user = renderSearchableArtPieces();
    await search(user, "Harvesters");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Show all" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText(/Results for/)).not.toBeInTheDocument();
  });

  test("shows a message when no art piece matches", async () => {
    const user = renderSearchableArtPieces();

    await search(user, "sculpture");

    expect(screen.getByText("No art pieces found")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("an empty search shows all art pieces", async () => {
    const user = renderSearchableArtPieces();

    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText(/Results for/)).not.toBeInTheDocument();
  });
});

describe("nationality dropdown", () => {
  test("lists the nationalities of the art pieces and filters by the chosen one", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ArtPieces
          artPieces={artPieces}
          artPiecesInfo={[]}
          onToggleFavorite={vi.fn()}
          isSearchable
        />
      </MemoryRouter>
    );
    const dropdown = screen.getByRole("combobox", { name: "Nationality" });
    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["All nationalities", "Dutch", "Flemish"]);

    await user.selectOptions(dropdown, "Flemish");
    // nothing changes before Search is clicked
    expect(screen.getAllByRole("listitem")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "The Harvesters" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Results from Flemish artists/)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show all" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText(/Results/)).not.toBeInTheDocument();
  });

  test("combines the dropdown with the search text", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ArtPieces
          artPieces={artPieces}
          artPiecesInfo={[]}
          onToggleFavorite={vi.fn()}
          isSearchable
        />
      </MemoryRouter>
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Nationality" }),
      "Dutch"
    );
    await user.type(
      screen.getByRole("searchbox", { name: "Search art pieces" }),
      "harvesters{Enter}"
    );

    expect(
      screen.getByText(/Results for “harvesters” from Dutch artists/)
    ).toBeInTheDocument();
    expect(screen.getByText("No art pieces found")).toBeInTheDocument();
  });
});

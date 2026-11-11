import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import ColorPalette, {
  COPIED_DURATION_MS,
  isSimilarColor,
} from "./ColorPalette";

const colors = ["#37412E", "#8D7332", "#838665"];

const currentArtPiece: ArtPiece = {
  slug: "wheat-field-with-cypresses",
  year: "1889",
  genre: "Landscape Painting",
  artist: "Vincent van Gogh",
  name: "Wheat Field with Cypresses",
  imageSource: "https://example.com/wheat-field.jpg",
  colors,
};

// #9A692E is close to #8D7332
const similarArtPiece: ArtPiece = {
  slug: "the-harvesters",
  year: "1565",
  genre: "Genre Painting",
  artist: "Pieter Bruegel the Elder",
  name: "The Harvesters",
  imageSource: "https://example.com/the-harvesters.jpg",
  colors: ["#9A692E", "#FFFFFF"],
};

const otherArtPiece: ArtPiece = {
  slug: "the-great-wave",
  year: "1831",
  genre: "Ukiyo-e Print",
  artist: "Katsushika Hokusai",
  name: "The Great Wave",
  imageSource: "https://example.com/the-great-wave.jpg",
  colors: ["#0000FF"],
};

const artPieces = [currentArtPiece, similarArtPiece, otherArtPiece];

function renderPalette() {
  return render(
    <MemoryRouter>
      <ColorPalette
        colors={colors}
        artPieces={artPieces}
        currentSlug={currentArtPiece.slug}
      />
    </MemoryRouter>
  );
}

function getSwatch(color: string) {
  return screen.getByRole("button", { name: `Copy color ${color}` });
}

function mockClipboard(writeText = vi.fn().mockResolvedValue(undefined)) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

// clicks a swatch and waits for the clipboard promise
async function copy(color: string) {
  await act(async () => {
    fireEvent.click(getSwatch(color));
  });
}

afterEach(() => {
  vi.useRealTimers();
});

test("shows a Color palette heading", () => {
  renderPalette();

  expect(
    screen.getByRole("heading", { name: "Color palette" })
  ).toBeInTheDocument();
});

test("shows one list item per color", () => {
  renderPalette();

  const palette = screen.getByRole("heading", { name: "Color palette" })
    .nextElementSibling as HTMLElement;
  expect(within(palette).getAllByRole("listitem")).toHaveLength(3);
});

test("shows each color as a circle with its code and a Similar button with an icon inside", () => {
  renderPalette();

  for (const color of colors) {
    // both buttons are hidden by CSS until the circle is hovered or focused
    const copyButton = getSwatch(color);
    const circle = copyButton.closest("li") as HTMLElement;
    expect(circle).toHaveClass("palette-swatch");
    expect(circle).toHaveStyle({ backgroundColor: color });
    expect(copyButton).toHaveTextContent(color);
    const similarButton = within(circle).getByRole("button", {
      name: `Find art pieces with a color similar to ${color}`,
    });
    // an icon instead of the word; the label names the button
    expect(similarButton).toHaveTextContent("");
    expect(similarButton).toHaveAttribute("title", "Similar colors");
    expect(similarButton.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  }
});

test("clicking a swatch copies its color code and shows Copied for 3 seconds", async () => {
  vi.useFakeTimers();
  const writeText = mockClipboard();
  renderPalette();

  await copy("#8D7332");

  expect(writeText).toHaveBeenCalledWith("#8D7332");
  const swatch = getSwatch("#8D7332");
  expect(within(swatch).getByText("Copied")).toBeInTheDocument();
  expect(swatch.closest("li")).toHaveClass("copied");

  act(() => {
    vi.advanceTimersByTime(COPIED_DURATION_MS - 1);
  });
  expect(within(swatch).getByText("Copied")).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1);
  });
  expect(within(swatch).getByText("#8D7332")).toBeInTheDocument();
  expect(swatch.closest("li")).not.toHaveClass("copied");
});

test("copying another color moves Copied to it and keeps only one timer", async () => {
  vi.useFakeTimers();
  mockClipboard();
  renderPalette();

  await copy("#37412E");
  await copy("#838665");

  expect(within(getSwatch("#37412E")).getByText("#37412E")).toBeInTheDocument();
  expect(within(getSwatch("#838665")).getByText("Copied")).toBeInTheDocument();
  expect(vi.getTimerCount()).toBe(1);
});

test("leaving the page while Copied is shown clears the timer", async () => {
  vi.useFakeTimers();
  mockClipboard();
  const { unmount } = renderPalette();
  await copy("#37412E");
  expect(vi.getTimerCount()).toBe(1);

  unmount();

  expect(vi.getTimerCount()).toBe(0);
});

test("keeps showing the color code when copying fails", async () => {
  mockClipboard(vi.fn().mockRejectedValue(new Error("No clipboard access")));
  renderPalette();

  await copy("#37412E");

  expect(within(getSwatch("#37412E")).getByText("#37412E")).toBeInTheDocument();
  expect(screen.queryByText("Copied")).not.toBeInTheDocument();
});

test("Similar shows the other art pieces with a similar color as links", () => {
  renderPalette();

  const button = screen.getByRole("button", {
    name: "Find art pieces with a color similar to #8D7332",
  });
  fireEvent.click(button);

  expect(button).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.getByRole("heading", {
      name: "Art pieces with a color similar to #8D7332",
    })
  ).toBeInTheDocument();
  const link = screen.getByRole("link", { name: /The Harvesters/ });
  expect(link).toHaveAttribute("href", "/art-pieces/the-harvesters");
  expect(
    within(link).getByRole("img", {
      name: "The Harvesters by Pieter Bruegel the Elder",
    })
  ).toHaveAttribute("src", "https://example.com/the-harvesters.jpg");
  // the current art piece and pieces without a similar color are left out
  expect(screen.getAllByRole("link")).toHaveLength(1);
});

test("shows a message when no other art piece has a similar color", () => {
  renderPalette();

  fireEvent.click(
    screen.getByRole("button", {
      name: "Find art pieces with a color similar to #37412E",
    })
  );

  expect(
    screen.getByText("No art pieces with a similar color")
  ).toBeInTheDocument();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});

test("a second click on the same Similar button hides the similar art pieces", () => {
  renderPalette();
  const similarButton = screen.getByRole("button", {
    name: "Find art pieces with a color similar to #8D7332",
  });

  fireEvent.click(similarButton);
  expect(similarButton).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.getByRole("heading", {
      name: "Art pieces with a color similar to #8D7332",
    })
  ).toBeInTheDocument();

  fireEvent.click(similarButton);
  expect(similarButton).toHaveAttribute("aria-pressed", "false");
  expect(
    screen.queryByRole("heading", { name: /Art pieces with a color similar/ })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});

test("does not change the art pieces", () => {
  const original = structuredClone(artPieces);
  renderPalette();

  fireEvent.click(
    screen.getByRole("button", {
      name: "Find art pieces with a color similar to #8D7332",
    })
  );

  expect(artPieces).toEqual(original);
});

describe("isSimilarColor", () => {
  test("is true for the same and for close colors", () => {
    expect(isSimilarColor("#8D7332", "#8D7332")).toBe(true);
    expect(isSimilarColor("#8D7332", "#9A692E")).toBe(true);
  });

  test("is false for colors far apart", () => {
    expect(isSimilarColor("#000000", "#FFFFFF")).toBe(false);
    expect(isSimilarColor("#37412E", "#0000FF")).toBe(false);
  });

  test("ignores upper and lower case", () => {
    expect(isSimilarColor("#8d7332", "#8D7332")).toBe(true);
  });
});

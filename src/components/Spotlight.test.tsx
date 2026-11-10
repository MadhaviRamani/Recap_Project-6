import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ArtPiece } from "../types";
import Spotlight, { SLIDESHOW_INTERVAL_MS } from "./Spotlight";

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

function mockRandomValue(value: number) {
  return vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
    (array as Uint32Array)[0] = value;
    return array;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

test("shows the image of the randomly selected art piece", () => {
  mockRandomValue(1);

  render(
    <Spotlight
      artPieces={artPieces}
      artPiecesInfo={[]}
      onToggleFavorite={vi.fn()}
    />
  );

  const image = screen.getByRole("img", {
    name: "The Harvesters by Pieter Bruegel the Elder",
  });
  expect(image).toHaveAttribute(
    "src",
    "https://example.com/the-harvesters.jpg"
  );
});

test("shows the title of the randomly selected art piece", () => {
  mockRandomValue(1);

  render(
    <Spotlight
      artPieces={artPieces}
      artPiecesInfo={[]}
      onToggleFavorite={vi.fn()}
    />
  );

  expect(
    screen.getByRole("heading", { name: "The Harvesters" })
  ).toBeInTheDocument();
});

test("shows the artist of the randomly selected art piece", () => {
  mockRandomValue(0);

  render(
    <Spotlight
      artPieces={artPieces}
      artPiecesInfo={[]}
      onToggleFavorite={vi.fn()}
    />
  );

  expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
});

test("keeps the same art piece when it re-renders", () => {
  const getRandomValues = mockRandomValue(0);

  const { rerender } = render(
    <Spotlight
      artPieces={artPieces}
      artPiecesInfo={[]}
      onToggleFavorite={vi.fn()}
    />
  );
  // a re-render would pick the other art piece if it were selected again
  getRandomValues.mockImplementation((array) => {
    (array as Uint32Array)[0] = 1;
    return array;
  });
  rerender(
    <Spotlight
      artPieces={artPieces}
      artPiecesInfo={[]}
      onToggleFavorite={vi.fn()}
    />
  );

  expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
  expect(getRandomValues).toHaveBeenCalledTimes(1);
});

test("shows nothing when there are no art pieces", () => {
  const { container } = render(
    <Spotlight artPieces={[]} artPiecesInfo={[]} onToggleFavorite={vi.fn()} />
  );

  expect(container).toBeEmptyDOMElement();
});

test("shows the favorite button and toggles the spotlighted art piece", async () => {
  const user = userEvent.setup();
  const onToggleFavorite = vi.fn();
  mockRandomValue(1);
  render(
    <Spotlight
      artPieces={artPieces}
      artPiecesInfo={[
        { slug: "the-harvesters", isFavorite: true, comments: [] },
      ]}
      onToggleFavorite={onToggleFavorite}
    />
  );

  const button = screen.getByRole("button", { name: "Favorite" });
  expect(button).toHaveAttribute("aria-pressed", "true");

  await user.click(button);
  expect(onToggleFavorite).toHaveBeenCalledWith("the-harvesters");
});

describe("shuffle and slideshow", () => {
  const harvesters = "The Harvesters";
  const wheatField = "Wheat Field with Cypresses";

  function renderSpotlight() {
    // starts with "The Harvesters"; with two art pieces, every change shows the other one
    mockRandomValue(1);
    return render(
      <Spotlight
        artPieces={artPieces}
        artPiecesInfo={[]}
        onToggleFavorite={vi.fn()}
      />
    );
  }

  function expectTitle(title: string) {
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  }

  function advanceSlideshow(times = 1) {
    act(() => {
      vi.advanceTimersByTime(SLIDESHOW_INTERVAL_MS * times);
    });
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("shows Shuffle and Play buttons while paused", () => {
    renderSpotlight();

    expect(screen.getByRole("button", { name: "Shuffle" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  test("clicking Shuffle shows another art piece", () => {
    renderSpotlight();
    expectTitle(harvesters);

    fireEvent.click(screen.getByRole("button", { name: "Shuffle" }));
    expectTitle(wheatField);

    fireEvent.click(screen.getByRole("button", { name: "Shuffle" }));
    expectTitle(harvesters);
  });

  test("does not change the art piece without Play", () => {
    renderSpotlight();

    advanceSlideshow(3);

    expectTitle(harvesters);
  });

  test("Play changes the art piece every 3 seconds and shows Pause while Shuffle stays", () => {
    renderSpotlight();

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByRole("button", { name: "Shuffle" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(SLIDESHOW_INTERVAL_MS - 1);
    });
    expectTitle(harvesters);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expectTitle(wheatField);

    advanceSlideshow();
    expectTitle(harvesters);
  });

  test("Pause keeps the current art piece and Play resumes", () => {
    renderSpotlight();

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    advanceSlideshow();
    expectTitle(wheatField);

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Shuffle" })).toBeInTheDocument();
    advanceSlideshow(5);
    expectTitle(wheatField);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    advanceSlideshow();
    expectTitle(harvesters);
  });

  test("runs only one timer after pausing and playing again", () => {
    renderSpotlight();

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(vi.getTimerCount()).toBe(1);

    advanceSlideshow();
    expectTitle(wheatField);
  });

  test("stops the timer when the Spotlight is removed", () => {
    const { unmount } = renderSpotlight();
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});

test("Shuffle keeps the only art piece when there is just one", () => {
  render(
    <Spotlight
      artPieces={[artPieces[0]]}
      artPiecesInfo={[]}
      onToggleFavorite={vi.fn()}
    />
  );

  fireEvent.click(screen.getByRole("button", { name: "Shuffle" }));

  expect(
    screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
  ).toBeInTheDocument();
});

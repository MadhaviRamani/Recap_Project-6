import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FavoriteButton from "./FavoriteButton";

test("shows a not pressed button for a non-favorite", () => {
  render(<FavoriteButton isFavorite={false} onToggleFavorite={vi.fn()} />);

  expect(screen.getByRole("button", { name: "Favorite" })).toHaveAttribute(
    "aria-pressed",
    "false"
  );
});

test("shows a pressed button with a lamp that is on for a favorite", () => {
  render(<FavoriteButton isFavorite onToggleFavorite={vi.fn()} />);

  const button = screen.getByRole("button", { name: "Favorite" });
  expect(button).toHaveAttribute("aria-pressed", "true");
  expect(button.querySelector("svg")).toHaveAttribute("fill", "currentColor");
});

test("calls onToggleFavorite when clicked", async () => {
  const user = userEvent.setup();
  const onToggleFavorite = vi.fn();
  render(
    <FavoriteButton isFavorite={false} onToggleFavorite={onToggleFavorite} />
  );

  await user.click(screen.getByRole("button", { name: "Favorite" }));

  expect(onToggleFavorite).toHaveBeenCalledTimes(1);
});

describe("lamp", () => {
  test("is off for a non-favorite: only an outline, without light", () => {
    render(<FavoriteButton isFavorite={false} onToggleFavorite={vi.fn()} />);

    const svg = screen
      .getByRole("button", { name: "Favorite" })
      .querySelector("svg");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg?.querySelector(".favorite-lamp-light")).not.toBeInTheDocument();
  });

  test("is on for a favorite: a filled shade and its light", () => {
    render(<FavoriteButton isFavorite onToggleFavorite={vi.fn()} />);

    const svg = screen
      .getByRole("button", { name: "Favorite" })
      .querySelector("svg");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg?.querySelector(".favorite-lamp-light")).toBeInTheDocument();
  });

  test("switches on and off when the favorite changes", () => {
    const { rerender } = render(
      <FavoriteButton isFavorite={false} onToggleFavorite={vi.fn()} />
    );
    const button = screen.getByRole("button", { name: "Favorite" });

    rerender(<FavoriteButton isFavorite onToggleFavorite={vi.fn()} />);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button.querySelector(".favorite-lamp-light")).toBeInTheDocument();

    rerender(<FavoriteButton isFavorite={false} onToggleFavorite={vi.fn()} />);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(
      button.querySelector(".favorite-lamp-light")
    ).not.toBeInTheDocument();
  });
});

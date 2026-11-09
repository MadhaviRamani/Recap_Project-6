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

test("shows a pressed button with a filled heart for a favorite", () => {
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

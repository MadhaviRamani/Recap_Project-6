import { render, screen, within } from "@testing-library/react";

import ColorPalette from "./ColorPalette";

const colors = ["#37412E", "#8D7332", "#838665"];

test("shows a Color palette heading", () => {
  render(<ColorPalette colors={colors} />);

  expect(
    screen.getByRole("heading", { name: "Color palette" })
  ).toBeInTheDocument();
});

test("shows one list item per color", () => {
  render(<ColorPalette colors={colors} />);

  const items = within(screen.getByRole("list")).getAllByRole("listitem");
  expect(items).toHaveLength(3);
});

test("shows each color visually as its background", () => {
  render(<ColorPalette colors={colors} />);

  for (const color of colors) {
    const item = screen.getByRole("listitem", { name: color });
    expect(item).toHaveStyle({ backgroundColor: color });
    expect(item).toHaveAttribute("title", color);
  }
});

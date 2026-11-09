import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import Navigation from "./Navigation";

function renderNavigation(route: string) {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Navigation />
    </MemoryRouter>
  );
}

test("shows a link labeled Spotlight to /", () => {
  renderNavigation("/");

  expect(screen.getByRole("link", { name: "Spotlight" })).toHaveAttribute(
    "href",
    "/"
  );
});

test("shows a link labeled Gallery to /art-pieces", () => {
  renderNavigation("/");

  expect(screen.getByRole("link", { name: "Gallery" })).toHaveAttribute(
    "href",
    "/art-pieces"
  );
});

test("highlights only the Spotlight link on /", () => {
  renderNavigation("/");

  expect(screen.getByRole("link", { name: "Spotlight" })).toHaveClass("active");
  expect(screen.getByRole("link", { name: "Gallery" })).not.toHaveClass(
    "active"
  );
});

test("highlights only the Gallery link on /art-pieces", () => {
  renderNavigation("/art-pieces");

  expect(screen.getByRole("link", { name: "Gallery" })).toHaveClass("active");
  expect(screen.getByRole("link", { name: "Spotlight" })).not.toHaveClass(
    "active"
  );
});

test("shows a link labeled Favorites to /favorites", () => {
  renderNavigation("/");

  expect(screen.getByRole("link", { name: "Favorites" })).toHaveAttribute(
    "href",
    "/favorites"
  );
});

test("highlights only the Favorites link on /favorites", () => {
  renderNavigation("/favorites");

  expect(screen.getByRole("link", { name: "Favorites" })).toHaveClass("active");
  expect(screen.getByRole("link", { name: "Spotlight" })).not.toHaveClass(
    "active"
  );
  expect(screen.getByRole("link", { name: "Gallery" })).not.toHaveClass(
    "active"
  );
});

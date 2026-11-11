import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

test("shows a link labeled Profile to /profile", () => {
  renderNavigation("/");

  expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
    "href",
    "/profile"
  );
});

test("highlights only the Profile link on /profile", () => {
  renderNavigation("/profile");

  expect(screen.getByRole("link", { name: "Profile" })).toHaveClass("active");
  expect(screen.getByRole("link", { name: "Spotlight" })).not.toHaveClass(
    "active"
  );
  expect(screen.getByRole("link", { name: "Gallery" })).not.toHaveClass(
    "active"
  );
  expect(screen.getByRole("link", { name: "Favorites" })).not.toHaveClass(
    "active"
  );
});

test("shows exactly the logo and the four page links in the main navigation", () => {
  renderNavigation("/");

  const navigation = screen.getByRole("navigation", { name: "Main" });
  const links = within(navigation).getAllByRole("link");
  // the logo and Profile are named by their aria-label, the others by their text
  expect(
    links.map((link) => link.getAttribute("aria-label") ?? link.textContent)
  ).toEqual([
    "Art Gallery – Spotlight",
    "Spotlight",
    "Gallery",
    "Favorites",
    "Profile",
  ]);
});

test("shows an M / R square logo with Art Gallery under it that links to /", () => {
  renderNavigation("/art-pieces");

  const logo = screen.getByRole("link", { name: "Art Gallery – Spotlight" });
  expect(logo).toHaveAttribute("href", "/");
  const square = logo.querySelector("svg");
  expect(square).toHaveAttribute("aria-hidden", "true");
  expect(square).toHaveTextContent("MR");
  expect(logo.lastElementChild).toHaveTextContent("Art Gallery");
});

test("does not highlight the logo, only the Spotlight link, on /", () => {
  renderNavigation("/");

  expect(
    screen.getByRole("link", { name: "Art Gallery – Spotlight" })
  ).not.toHaveClass("active");
  expect(screen.getByRole("link", { name: "Spotlight" })).toHaveClass("active");
});

test("shows Profile only as a user icon without visible text", () => {
  renderNavigation("/");

  const profile = screen.getByRole("link", { name: "Profile" });
  expect(profile.textContent).toBe("");
  expect(profile.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
});

describe("search bar", () => {
  function renderWithSearch(route: string, onSearch = vi.fn()) {
    render(
      <MemoryRouter initialEntries={[route]}>
        <Navigation search={{ query: "", onSearch, onShowAll: vi.fn() }} />
      </MemoryRouter>
    );
    return onSearch;
  }

  test.each(["/art-pieces", "/favorites"])(
    "is shown in the navigation on %s, closed, without nationalities",
    (route) => {
      renderWithSearch(route);

      const navigation = screen.getByRole("navigation", { name: "Main" });
      expect(within(navigation).getByRole("search")).toBeInTheDocument();
      expect(
        within(navigation).getByRole("button", { name: "Open search" })
      ).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    }
  );

  test.each(["/", "/art-pieces/the-harvesters", "/profile", "/unknown"])(
    "is not shown on %s",
    (route) => {
      renderWithSearch(route);

      expect(screen.queryByRole("search")).not.toBeInTheDocument();
    }
  );

  test("is not shown without a search", () => {
    renderNavigation("/art-pieces");

    expect(screen.queryByRole("search")).not.toBeInTheDocument();
  });

  test("sits between Favorites and the profile icon", async () => {
    const user = userEvent.setup();
    renderWithSearch("/art-pieces");

    const search = screen.getByRole("search");
    expect(search.previousElementSibling).toBe(
      screen.getByRole("link", { name: "Favorites" })
    );
    expect(search.nextElementSibling).toBe(
      screen.getByRole("link", { name: "Profile" })
    );

    // Tab goes Favorites, magnifying glass, Profile
    screen.getByRole("link", { name: "Favorites" }).focus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Open search" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Profile" })).toHaveFocus();
  });

  test("opens the field and passes the search to onSearch", async () => {
    const user = userEvent.setup();
    const onSearch = renderWithSearch("/favorites");

    await user.click(screen.getByRole("button", { name: "Open search" }));
    await user.type(
      screen.getByRole("searchbox", { name: "Search art pieces" }),
      "wave{Enter}"
    );

    expect(onSearch).toHaveBeenCalledWith("wave");
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SearchBar from "./SearchBar";

function renderSearchBar({
  query = "",
  onSearch = vi.fn(),
  onShowAll = vi.fn(),
} = {}) {
  render(
    <>
      <SearchBar query={query} onSearch={onSearch} onShowAll={onShowAll} />
      <button type="button">Outside</button>
    </>
  );
  return { user: userEvent.setup(), onSearch, onShowAll };
}

function getToggle(name: "Open search" | "Close search") {
  return screen.getByRole("button", { name });
}

async function openSearch(user: ReturnType<typeof userEvent.setup>) {
  await user.click(getToggle("Open search"));
  return screen.getByRole("searchbox", { name: "Search art pieces" });
}

test("at first shows only the magnifying glass, the field is closed", () => {
  renderSearchBar();

  const toggle = getToggle("Open search");
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(toggle).toHaveAttribute("aria-controls", "search-input");
  expect(toggle.textContent).toBe("");
  expect(toggle.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  // the closed field is hidden from screen readers and the keyboard
  expect(
    screen.queryByRole("searchbox", { name: "Search art pieces" })
  ).not.toBeInTheDocument();
  expect(
    document.getElementById("search-input")?.parentElement
  ).toHaveAttribute("inert");
});

test("there is no nationality dropdown", () => {
  renderSearchBar();

  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
});

test("the keyboard does not reach the closed field", async () => {
  const { user } = renderSearchBar();

  await user.tab();
  expect(getToggle("Open search")).toHaveFocus();
  await user.tab();
  expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
});

test("a click on the magnifying glass opens the field and focuses it", async () => {
  const { user, onSearch } = renderSearchBar();

  const input = await openSearch(user);

  expect(input).toHaveFocus();
  expect(input).toHaveAttribute("id", "search-input");
  expect(getToggle("Close search")).toHaveAttribute("aria-expanded", "true");
  expect(onSearch).not.toHaveBeenCalled();
});

test("Enter searches with the text without extra spaces and keeps it", async () => {
  const { user, onSearch } = renderSearchBar();
  const input = await openSearch(user);

  await user.type(input, "  great \t  wave {Enter}");

  expect(onSearch).toHaveBeenCalledTimes(1);
  expect(onSearch).toHaveBeenCalledWith("great wave");
  expect(input).toHaveValue("  great \t  wave ");
  expect(getToggle("Close search")).toHaveAttribute("aria-expanded", "true");
});

test("a second click on the magnifying glass closes the field without searching", async () => {
  const { user, onSearch } = renderSearchBar();
  const input = await openSearch(user);
  await user.type(input, "wave");

  await user.click(getToggle("Close search"));

  expect(onSearch).not.toHaveBeenCalled();
  expect(getToggle("Open search")).toHaveAttribute("aria-expanded", "false");
  expect(
    screen.queryByRole("searchbox", { name: "Search art pieces" })
  ).not.toBeInTheDocument();

  // a third click opens it again
  await user.click(getToggle("Open search"));
  expect(getToggle("Close search")).toHaveAttribute("aria-expanded", "true");
});

test("an empty search or only spaces does nothing", async () => {
  const { user, onSearch } = renderSearchBar();
  const input = await openSearch(user);

  await user.type(input, "{Enter}");
  await user.type(input, "   {Enter}");

  expect(onSearch).not.toHaveBeenCalled();
  expect(input).toHaveValue("   ");
});

test("Escape closes an empty field and puts the focus on the magnifying glass", async () => {
  const { user } = renderSearchBar();
  await openSearch(user);

  await user.keyboard("{Escape}");

  expect(getToggle("Open search")).toHaveFocus();
  expect(getToggle("Open search")).toHaveAttribute("aria-expanded", "false");
});

test("Escape keeps a field with text open", async () => {
  const { user } = renderSearchBar();
  const input = await openSearch(user);

  await user.type(input, "wave{Escape}");

  expect(getToggle("Close search")).toHaveAttribute("aria-expanded", "true");
});

test("a click outside closes an empty field, but not one with text", async () => {
  const { user } = renderSearchBar();
  const input = await openSearch(user);

  await user.type(input, "wave");
  await user.click(screen.getByRole("button", { name: "Outside" }));
  expect(getToggle("Close search")).toHaveAttribute("aria-expanded", "true");

  await user.clear(input);
  await user.click(screen.getByRole("button", { name: "Outside" }));
  expect(getToggle("Open search")).toHaveAttribute("aria-expanded", "false");
});

test("a click inside the open field keeps it open", async () => {
  const { user } = renderSearchBar();
  const input = await openSearch(user);

  await user.click(input);

  expect(getToggle("Close search")).toHaveAttribute("aria-expanded", "true");
});

test("without an active search there is no clear button", async () => {
  const { user } = renderSearchBar();
  await openSearch(user);

  expect(
    screen.queryByRole("button", { name: "Show all art pieces" })
  ).not.toBeInTheDocument();
});

test("during a search the clear button in the field shows all art pieces again", async () => {
  const { user, onShowAll } = renderSearchBar({ query: "wave" });
  const input = await openSearch(user);
  await user.type(input, "wave");

  const clear = screen.getByRole("button", { name: "Show all art pieces" });
  expect(input.parentElement).toContainElement(clear);
  expect(clear.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  await user.click(clear);

  expect(onShowAll).toHaveBeenCalledTimes(1);
  expect(getToggle("Open search")).toHaveAttribute("aria-expanded", "false");
  expect(getToggle("Open search")).toHaveFocus();
  expect(document.getElementById("search-input")).toHaveValue("");
});

test("a form submitted while the field is closed does not search", () => {
  const { onSearch } = renderSearchBar();

  fireEvent.submit(screen.getByRole("search"));

  expect(onSearch).not.toHaveBeenCalled();
  expect(getToggle("Open search")).toHaveAttribute("aria-expanded", "false");
});

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SearchBar from "./SearchBar";

function renderSearchBar(onSearch = vi.fn()) {
  render(
    <SearchBar nationalities={["Dutch", "Japanese"]} onSearch={onSearch} />
  );
  return userEvent.setup();
}

test("shows the search input, the nationality dropdown and the Search button in this order", () => {
  renderSearchBar();

  const input = screen.getByRole("searchbox", { name: "Search art pieces" });
  const dropdown = screen.getByRole("combobox", { name: "Nationality" });
  const button = screen.getByRole("button", { name: "Search" });
  expect(input.nextElementSibling).toBe(dropdown);
  expect(dropdown.nextElementSibling).toBe(button);
});

test("the dropdown lists all nationalities after All nationalities", () => {
  renderSearchBar();

  expect(screen.getByRole("combobox", { name: "Nationality" })).toHaveValue("");
  expect(
    screen.getAllByRole("option").map((option) => option.textContent)
  ).toEqual(["All nationalities", "Dutch", "Japanese"]);
});

test("clicking Search passes the trimmed text and the nationality, then clears both", async () => {
  const onSearch = vi.fn();
  const user = renderSearchBar(onSearch);
  const input = screen.getByRole("searchbox", { name: "Search art pieces" });
  const dropdown = screen.getByRole("combobox", { name: "Nationality" });

  await user.type(input, "  Great Wave ");
  await user.selectOptions(dropdown, "Japanese");
  expect(onSearch).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Search" }));

  expect(onSearch).toHaveBeenCalledWith("Great Wave", "Japanese");
  expect(input).toHaveValue("");
  expect(dropdown).toHaveValue("");
});

test("pressing Enter also searches, with all nationalities by default", async () => {
  const onSearch = vi.fn();
  const user = renderSearchBar(onSearch);

  await user.type(
    screen.getByRole("searchbox", { name: "Search art pieces" }),
    "VAN GOGH{Enter}"
  );

  expect(onSearch).toHaveBeenCalledWith("VAN GOGH", "");
});

describe("Search button", () => {
  function getSearchButton() {
    return screen.getByRole("button", { name: "Search" });
  }

  test("is disabled while there is nothing to search", () => {
    renderSearchBar();

    expect(getSearchButton()).toBeDisabled();
  });

  test("stays disabled with only spaces, and Enter does not search", async () => {
    const onSearch = vi.fn();
    const user = renderSearchBar(onSearch);
    const input = screen.getByRole("searchbox", { name: "Search art pieces" });

    await user.type(input, "   ");
    expect(getSearchButton()).toBeDisabled();

    await user.type(input, "{Enter}");
    await user.click(getSearchButton());

    expect(onSearch).not.toHaveBeenCalled();
    expect(input).toHaveValue("   ");
  });

  test("is enabled with a letter in the search field", async () => {
    const user = renderSearchBar();

    await user.type(
      screen.getByRole("searchbox", { name: "Search art pieces" }),
      " a"
    );

    expect(getSearchButton()).toBeEnabled();
  });

  test("is enabled with a chosen nationality and an empty field", async () => {
    const onSearch = vi.fn();
    const user = renderSearchBar(onSearch);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Nationality" }),
      "Dutch"
    );
    expect(getSearchButton()).toBeEnabled();
    await user.click(getSearchButton());

    expect(onSearch).toHaveBeenCalledWith("", "Dutch");
  });

  test("passes the text without extra spaces and is disabled again after the search", async () => {
    const onSearch = vi.fn();
    const user = renderSearchBar(onSearch);

    await user.type(
      screen.getByRole("searchbox", { name: "Search art pieces" }),
      "  great \t  wave "
    );
    await user.click(getSearchButton());

    expect(onSearch).toHaveBeenCalledWith("great wave", "");
    expect(getSearchButton()).toBeDisabled();
  });

  test("a form submitted without anything to search does not search", () => {
    const onSearch = vi.fn();
    renderSearchBar(onSearch);

    // e.g. submitted by a script; the disabled button blocks Enter and clicks
    fireEvent.submit(screen.getByRole("search"));

    expect(onSearch).not.toHaveBeenCalled();
  });
});

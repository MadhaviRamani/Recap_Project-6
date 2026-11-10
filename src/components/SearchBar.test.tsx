import { render, screen } from "@testing-library/react";
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

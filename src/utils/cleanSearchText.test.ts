import { cleanSearchText } from "./cleanSearchText";

test("turns several spaces between words into one", () => {
  expect(cleanSearchText("van   gogh")).toBe("van gogh");
});

test("removes the spaces around the text", () => {
  expect(cleanSearchText("  great wave  ")).toBe("great wave");
});

test("counts tabs and non-breaking spaces as spaces", () => {
  expect(cleanSearchText("van\tgogh")).toBe("van gogh");
  expect(cleanSearchText("van  gogh")).toBe("van gogh");
});

test("returns an empty text for only spaces", () => {
  expect(cleanSearchText(" \t  ")).toBe("");
});

test("keeps a clean text as it is", () => {
  expect(cleanSearchText("The Card Players")).toBe("The Card Players");
});

import {
  DARK_MODE_KEY,
  loadIsDarkMode,
  loadProfileName,
  PROFILE_NAME_KEY,
  saveIsDarkMode,
  saveProfileName,
} from "./profileStorage";

test("returns the default name when nothing is stored", () => {
  expect(loadProfileName("Art Lover")).toBe("Art Lover");
});

test("returns the default name when the stored name is empty", () => {
  localStorage.setItem(PROFILE_NAME_KEY, "   ");

  expect(loadProfileName("Art Lover")).toBe("Art Lover");
});

test("returns the saved name", () => {
  saveProfileName("Ada");

  expect(localStorage.getItem(PROFILE_NAME_KEY)).toBe("Ada");
  expect(loadProfileName("Art Lover")).toBe("Ada");
});

test("starts in dark mode when nothing is stored", () => {
  expect(loadIsDarkMode()).toBe(true);
});

test("starts in dark mode when the stored value is broken", () => {
  localStorage.setItem(DARK_MODE_KEY, "maybe");

  expect(loadIsDarkMode()).toBe(true);
});

test("returns the saved dark mode setting", () => {
  saveIsDarkMode(false);

  expect(localStorage.getItem(DARK_MODE_KEY)).toBe("false");
  expect(loadIsDarkMode()).toBe(false);

  saveIsDarkMode(true);

  expect(loadIsDarkMode()).toBe(true);
});

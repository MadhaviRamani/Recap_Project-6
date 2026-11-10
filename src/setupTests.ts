import "@testing-library/jest-dom/vitest";

// favorites and comments are persisted, so every test starts with empty storage
afterEach(() => {
  localStorage.clear();
});

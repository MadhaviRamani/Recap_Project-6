import { splitIntoWalls } from "./splitIntoWalls";

function numbers(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index + 1);
}

test("hangs 5 on the left, 5 on the right and 1 on the front wall", () => {
  expect(splitIntoWalls(numbers(11))).toEqual({
    left: [1, 2, 3, 4, 5],
    right: [6, 7, 8, 9, 10],
    front: [11],
  });
});

test("fills the left wall first, then the right wall", () => {
  expect(splitIntoWalls(numbers(7))).toEqual({
    left: [1, 2, 3, 4, 5],
    right: [6, 7],
    front: [],
  });
});

test("puts a few items only on the left wall", () => {
  expect(splitIntoWalls(numbers(3))).toEqual({
    left: [1, 2, 3],
    right: [],
    front: [],
  });
});

test("returns empty walls for no items", () => {
  expect(splitIntoWalls([])).toEqual({ left: [], right: [], front: [] });
});

test("hangs every item after the side walls on the front wall", () => {
  expect(splitIntoWalls(numbers(12)).front).toEqual([11, 12]);
});

test("does not change the given items", () => {
  const items = numbers(11);
  splitIntoWalls(items);
  expect(items).toEqual(numbers(11));
});

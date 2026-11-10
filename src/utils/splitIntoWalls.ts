// how many art pieces hang on each side wall of the gallery hallway
export const SIDE_WALL_SIZE = 5;

export type Walls<T> = {
  left: T[];
  right: T[];
  front: T[];
};

// the left wall fills first, then the right wall; the rest hangs on the front wall
export function splitIntoWalls<T>(items: T[]): Walls<T> {
  return {
    left: items.slice(0, SIDE_WALL_SIZE),
    right: items.slice(SIDE_WALL_SIZE, SIDE_WALL_SIZE * 2),
    front: items.slice(SIDE_WALL_SIZE * 2),
  };
}

import type { Grid, Settings } from "./jirai.types.ts";

/** Names for the supported square, four-neighbour, hex, and wrap grids. */
export const GRIDS = { square: "square", orthogonal: "orthogonal", hex: "hex", wrap: "wrap" } as const;
/** Names for the game lifecycle states. */
export const STATUSES = { ready: "ready", playing: "playing", won: "won", lost: "lost" } as const;
/** Names for the cell mark cycle. */
export const MARKS = { covered: "covered", flag: "flag", question: "question", open: "open" } as const;
/** Names for the moves accepted by the engine. */
export const MOVES = { reveal: "reveal", mark: "mark", chord: "chord" } as const;
/** Neighbour offsets and edge behaviour for each topology. Hex coordinates are axial: each row is displaced half a cell to the right. */
export const GRID_SPECS: Record<Grid, { offsets: readonly (readonly [number, number])[]; wrap: boolean }> = {
  square: { offsets: [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]], wrap: false },
  orthogonal: { offsets: [[0,-1],[-1,0],[1,0],[0,1]], wrap: false },
  hex: { offsets: [[-1,0],[1,0],[0,-1],[1,-1],[-1,1],[0,1]], wrap: false },
  wrap: { offsets: [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]], wrap: true },
};
/** The four difficulty levels, easiest first. Each is a larger and denser field than the one before. */
export const LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
/** The 0.1 and 0.2 names for the first three levels. They are still accepted wherever a level is. */
export const LEVEL_ALIASES = { beginner: "easy", intermediate: "medium", expert: "hard" } as const;
/** Size and mine count of each level on a rectangular board. Shaped boards keep the size and the density. */
export const LEVEL_SIZES: Record<(typeof LEVELS)[number], { width: number; height: number; mines: number }> = {
  easy: { width: 9, height: 9, mines: 10 },
  medium: { width: 16, height: 16, mines: 40 },
  hard: { width: 30, height: 16, mines: 99 },
  "extra-hard": { width: 40, height: 24, mines: 240 },
};
/**
 * The huge fields: four times the area of a 16×16 (the medium level), 1,024 to 1,152 squares, for a long solve. The same
 * share of mines as a level, see `hugeSettings`. They are dealt, proved and drawn like any other field: a no-guess deal takes
 * a few milliseconds to a tenth of a second here, and 2,400 squares is the most `validSettings` accepts.
 */
export const HUGE_SIZES = [{ width: 32, height: 32 }, { width: 48, height: 24 }, { width: 24, height: 48 }] as const satisfies readonly { width: number; height: number }[];
/** Common minefield dimensions and mine counts. The levels, their older names, and two shapes of field. */
export const PRESETS = {
  ...LEVEL_SIZES,
  beginner: LEVEL_SIZES.easy,
  intermediate: LEVEL_SIZES.medium,
  expert: LEVEL_SIZES.hard,
  wide: { width: 21, height: 9, mines: 24 },
  tall: { width: 9, height: 21, mines: 24 },
} as const;
/** Default easy game, with a verified no-guess board and clear opening. */
export const DEFAULT_SETTINGS: Settings = { ...LEVEL_SIZES.easy, grid: GRIDS.square, noGuess: true, opening: "clear", seed: 1 };
/** Largest width or height accepted by settings validation. */
export const MAX_SIDE = 60;
/** Largest total cell count accepted by settings validation. */
export const MAX_CELLS = 2400;
/** Default number of random layouts tried before a no-guess deal falls back to repairing the closest one. */
export const GENERATION_ATTEMPTS = 128;
/** Largest frontier enumerated for exact deductions. */
export const ENUMERATION_CELLS = 18;
/** Maximum partial assignments checked in one exact deduction search. */
export const ENUMERATION_NODES = 100_000;

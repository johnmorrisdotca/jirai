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
/** Common minefield dimensions and mine counts. */
export const PRESETS = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 },
  wide: { width: 21, height: 9, mines: 24 },
  tall: { width: 9, height: 21, mines: 24 },
} as const;
/** Default beginner game, with a verified no-guess board and clear opening. */
export const DEFAULT_SETTINGS: Settings = { ...PRESETS.beginner, grid: GRIDS.square, noGuess: true, opening: "clear", seed: 1 };
/** Largest width or height accepted by settings validation. */
export const MAX_SIDE = 60;
/** Largest total cell count accepted by settings validation. */
export const MAX_CELLS = 2400;
/** Default candidate-board budget for verified generation. */
export const GENERATION_ATTEMPTS = 128;
/** Largest frontier enumerated for exact deductions. */
export const ENUMERATION_CELLS = 18;
/** Maximum partial assignments checked in one exact deduction search. */
export const ENUMERATION_NODES = 100_000;

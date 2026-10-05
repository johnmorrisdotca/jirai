import type { Grid, Settings } from "./jirai.types.ts";

export const GRIDS = { square: "square", orthogonal: "orthogonal", hex: "hex", wrap: "wrap" } as const;
export const STATUSES = { ready: "ready", playing: "playing", won: "won", lost: "lost" } as const;
export const MARKS = { covered: "covered", flag: "flag", question: "question", open: "open" } as const;
export const MOVES = { reveal: "reveal", mark: "mark", chord: "chord" } as const;
/** Hex coordinates are axial: a row is displaced half a cell to the right. */
export const GRID_SPECS: Record<Grid, { offsets: readonly (readonly [number, number])[]; wrap: boolean }> = {
  square: { offsets: [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]], wrap: false },
  orthogonal: { offsets: [[0,-1],[-1,0],[1,0],[0,1]], wrap: false },
  hex: { offsets: [[-1,0],[1,0],[0,-1],[1,-1],[-1,1],[0,1]], wrap: false },
  wrap: { offsets: [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]], wrap: true },
};
export const PRESETS = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 },
  wide: { width: 21, height: 9, mines: 24 },
  tall: { width: 9, height: 21, mines: 24 },
} as const;
export const DEFAULT_SETTINGS: Settings = { ...PRESETS.beginner, grid: GRIDS.square, noGuess: true, opening: "clear", seed: 1 };
export const MAX_SIDE = 60;
export const MAX_CELLS = 2400;
export const GENERATION_ATTEMPTS = 128;
export const ENUMERATION_CELLS = 18;
export const ENUMERATION_NODES = 100_000;

import { describe, expect, it } from "vitest";
import { GenerationError, isSolvable, makeBoard } from "./generate.ts";
import { neighbours, neighboursOf } from "./grid.ts";
import { DEFAULT_SETTINGS, GENERATION_ATTEMPTS, GRIDS, LEVELS } from "./jirai.constants.ts";
import { levelSettings } from "./levels.ts";
import { seededRandom } from "./random.ts";
import { activeCell, activeCells, SHAPES } from "./shape.ts";
import type { Board, Grid, Settings } from "./jirai.types.ts";

const SEEDS = 10;

/** Everything a dealt board must be, whatever dealt it. */
function expectSound(settings: Settings, board: Board, first: number): void {
  const adjacent = neighboursOf(settings);
  expect(board.mines.filter(Boolean)).toHaveLength(settings.mines);
  for (let cell = 0; cell < settings.width * settings.height; cell += 1) {
    if (!activeCell(settings, cell)) { expect(board.mines[cell]).toBe(false); expect(board.clues[cell]).toBe(-2); continue; }
    expect(board.clues[cell]).toBe(board.mines[cell] ? -1 : adjacent[cell]!.filter((n) => board.mines[n]).length);
  }
  expect(board.mines[first]).toBe(false);
  if (settings.opening === "clear") for (const n of neighbours(settings, first)) expect(board.mines[n]).toBe(false);
  expect(isSolvable(board)).toBe(true);
}

describe("verified boards at every level, on every rule and outline", () => {
  for (const grid of Object.values(GRIDS) as Grid[]) for (const shape of SHAPES) {
    if (grid === "wrap" && shape !== "rectangle") continue;
    it(`${grid} ${shape}: all four levels, ${SEEDS} seeds each, from an opening anywhere on the field`, () => {
      const random = seededRandom(2026);
      for (const level of LEVELS) {
        const size = levelSettings(level, { grid, shape });
        for (let seed = 1; seed <= SEEDS; seed += 1) {
          const settings: Settings = { ...DEFAULT_SETTINGS, ...size, grid, shape, seed };
          const cells = activeCells(settings);
          // A cell with no neighbours cannot be opened from without a guess; that is refused, and tested below.
          const open = cells.filter((cell) => neighbours(settings, cell).length > 0);
          const first = open[Math.floor(random() * open.length)]!;
          expectSound(settings, makeBoard(settings, first), first);
        }
      }
    });
  }
  it("deals the same extra-hard field for the same seed, and a different one for another", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, ...levelSettings("extra-hard"), seed: 4 };
    const a = makeBoard(settings, 500), b = makeBoard(settings, 500);
    expect(b).toEqual(a);
    expect(makeBoard({ ...settings, seed: 5 }, 500).mines).not.toEqual(a.mines);
  });
  it("deals extra-hard fields with the safe opening too", () => {
    for (const grid of Object.values(GRIDS) as Grid[]) for (let seed = 1; seed <= 3; seed += 1) {
      const settings: Settings = { ...DEFAULT_SETTINGS, ...levelSettings("extra-hard"), grid, opening: "safe", seed };
      expectSound(settings, makeBoard(settings, 500), 500);
    }
  });
});

describe("repairing a layout", () => {
  it("rescues what random layouts never solve: orthogonal 30×16 with 99 mines used to fail five times in six", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, width: 30, height: 16, mines: 99, grid: "orthogonal" };
    let rescued = 0;
    for (let seed = 1; seed <= 6; seed += 1) {
      const board = makeBoard({ ...settings, seed }, 255);
      expectSound({ ...settings, seed }, board, 255);
      if (board.attempt >= GENERATION_ATTEMPTS) rescued += 1;
    }
    expect(rescued).toBeGreaterThan(2);
  });
  it("is switched off by repair: false, which gives the 0.2 behaviour of giving up after the random layouts", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, width: 30, height: 16, mines: 99, grid: "orthogonal", seed: 1 };
    expect(() => makeBoard(settings, 255, { repair: false })).toThrow(GenerationError);
    expect(() => makeBoard(settings, 255, { repairs: 0 })).toThrow(GenerationError);
    expect(makeBoard(settings, 255).attempt).toBeGreaterThanOrEqual(GENERATION_ATTEMPTS);
  });
  it("still says so when it cannot: a field with no proof within the work given is an error, never a guessing board", () => {
    let failures = 0;
    for (let seed = 1; seed <= 20; seed += 1) {
      try { expect(isSolvable(makeBoard({ ...DEFAULT_SETTINGS, width: 6, height: 6, mines: 17, opening: "safe", seed }, 14, { attempts: 1, repairs: 3 }))).toBe(true); }
      catch (error) { expect(error).toBeInstanceOf(GenerationError); expect((error as GenerationError).code).toBe("exhausted"); failures += 1; }
    }
    expect(failures).toBeGreaterThan(0);
  });
  it("counts the work in layouts, never in time, so a seed is always the same board", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, ...levelSettings("extra-hard", { grid: "orthogonal", shape: "heart" }), grid: "orthogonal", shape: "heart", seed: 9 };
    const first = activeCells(settings)[400]!;
    const a = makeBoard(settings, first);
    expect(makeBoard(settings, first)).toEqual(a);
    expect(a.attempt).toBeGreaterThanOrEqual(GENERATION_ATTEMPTS);
  });
  it("refuses an opening on a cell that touches nothing, where no clue can follow, and says which", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, ...levelSettings("extra-hard", { grid: "orthogonal", shape: "star" }), grid: "orthogonal", shape: "star", seed: 1 };
    const lonely = activeCells(settings).find((cell) => neighbours(settings, cell).length === 0);
    expect(lonely).toBeDefined();
    try { makeBoard(settings, lonely!); expect.unreachable(); } catch (error) { expect((error as GenerationError).code).toBe("opening"); }
    expect(() => makeBoard({ ...settings, noGuess: false }, lonely!)).not.toThrow();
  });
  it("deals a field whose cut-off corners are mines nobody needs to find, when no chain of neighbours reaches them", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, ...levelSettings("extra-hard", { grid: "orthogonal", shape: "star" }), grid: "orthogonal", shape: "star", seed: 2 };
    const first = activeCells(settings).find((cell) => neighbours(settings, cell).length > 0)!;
    const board = makeBoard(settings, first);
    for (const cell of activeCells(settings)) if (neighbours(settings, cell).length === 0) expect(board.mines[cell]).toBe(true);
    expect(isSolvable(board)).toBe(true);
  });
  it("rejects work limits that are not numbers it can use", () => {
    for (const options of [{ repairs: -1 }, { repairs: 1.5 }, { repairs: 2_000_000 }, { attempts: 0 }]) expect(() => makeBoard(DEFAULT_SETTINGS, 40, options)).toThrow(GenerationError);
  });
});

// The huge fields: four times the area of a 16×16, dealt in a browser's time and still proved to need no guess.
import { describe, expect, it, vi } from "vitest";
import { hintFor } from "./deduce.ts";
import { isSolvable, makeBoard } from "./generate.ts";
import { newGame, play, visibleGame, withBoard } from "./game.ts";
import { neighbours } from "./grid.ts";
import { DEFAULT_SETTINGS, GRIDS, HUGE_SIZES, LEVELS, LEVEL_SIZES, MAX_CELLS } from "./jirai.constants.ts";
import { validSettings } from "./grid.ts";
import { hugeSettings } from "./levels.ts";
import { activeCells, SHAPES } from "./shape.ts";
import type { Grid, Level, Settings } from "./jirai.types.ts";

vi.setConfig({ testTimeout: 120_000 });

/** The active square nearest the middle that has a neighbour, as the site opens a field. */
function middle(settings: Settings): number {
  const cx = (settings.width - 1) / 2, cy = (settings.height - 1) / 2;
  let best = -1, nearest = Infinity;
  for (const cell of activeCells(settings)) {
    if (neighbours(settings, cell).length === 0) continue;
    const distance = ((cell % settings.width) - cx) ** 2 + (Math.floor(cell / settings.width) - cy) ** 2;
    if (distance < nearest) { best = cell; nearest = distance; }
  }
  return best;
}

describe("huge sizes", () => {
  it("are 1,024 to 1,152 squares, four times a 16 by 16 or a little more, and inside what settings accept", () => {
    expect(HUGE_SIZES.map((size) => size.width * size.height)).toEqual([1024, 1152, 1152]);
    expect(HUGE_SIZES[0]!.width * HUGE_SIZES[0]!.height).toBe(4 * LEVEL_SIZES.medium.width * LEVEL_SIZES.medium.height);
    for (const size of HUGE_SIZES) expect(size.width * size.height).toBeLessThanOrEqual(MAX_CELLS);
  });

  it("keep each level's share of mines, rounded, on a rectangle", () => {
    expect(hugeSettings("easy")).toEqual({ width: 32, height: 32, mines: 126 });
    expect(hugeSettings("medium")).toEqual({ width: 32, height: 32, mines: 160 });
    expect(hugeSettings("hard")).toEqual({ width: 32, height: 32, mines: 211 });
    expect(hugeSettings("extra-hard")).toEqual({ width: 32, height: 32, mines: 256 });
    expect(hugeSettings("expert", { size: { width: 48, height: 24 } })).toEqual({ width: 48, height: 24, mines: 238 });
    expect(() => hugeSettings("wide" as never)).toThrow(RangeError);
    expect(() => hugeSettings("easy", { size: { width: 40, height: 24 } })).toThrow(RangeError);
  });

  for (const grid of Object.values(GRIDS) as Grid[]) for (const shape of SHAPES) {
    if (grid === "wrap" && shape !== "rectangle") continue;
    it(`are valid, dealt and proved to need no guess at every level and size, ${grid} ${shape}`, () => {
      for (const level of LEVELS) for (const size of shape === "rectangle" ? HUGE_SIZES : HUGE_SIZES.slice(0, 1)) {
        const huge = hugeSettings(level, { grid, shape, size });
        const settings: Settings = { ...DEFAULT_SETTINGS, ...huge, grid, shape, seed: 11 };
        expect(validSettings(settings), `${level} ${size.width}x${size.height}`).toBe(true);
        const cells = activeCells(settings).length;
        const own = LEVEL_SIZES[level];
        expect(Math.abs(huge.mines / cells - own.mines / (own.width * own.height))).toBeLessThan(0.01);
        const first = middle(settings);
        const board = makeBoard(settings, first);
        expect(board.mines.filter(Boolean)).toHaveLength(settings.mines);
        expect(board.mines[first]).toBe(false);
        expect(isSolvable(board), `${level} ${size.width}x${size.height}`).toBe(true);
      }
    });
  }

  for (const level of ["easy", "extra-hard"] as Level[]) it(`are won by the explained hints alone at ${level}, never a guess`, () => {
    for (const grid of ["square", "orthogonal"] as Grid[]) {
      const settings: Settings = { ...DEFAULT_SETTINGS, ...hugeSettings(level, { grid }), grid, seed: 3 };
      const first = middle(settings);
      let game = play(withBoard(newGame(settings), makeBoard(settings, first)), { kind: "reveal", cell: first });
      for (let step = 0; step < 4000 && game.status === "playing"; step += 1) {
        const hint = hintFor(visibleGame(game));
        const safe = hint.safe.find((cell) => game.marks[cell] !== "open");
        if (safe !== undefined) { game = play(game, { kind: "reveal", cell: safe }); continue; }
        const mine = hint.mines.find((cell) => game.marks[cell] !== "flag");
        if (mine === undefined) break;
        game = play(game, { kind: "mark", cell: mine });
      }
      expect(game.status, `${grid} ${level}`).toBe("won");
    }
  });
});

import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, GRIDS, LEVELS, LEVEL_ALIASES, LEVEL_SIZES, PRESETS } from "./jirai.constants.ts";
import { validSettings } from "./grid.ts";
import { levelNamed, levelSettings } from "./levels.ts";
import { activeCells, SHAPES } from "./shape.ts";
import type { Grid, Settings } from "./jirai.types.ts";

describe("the four levels", () => {
  it("are easy, medium, hard and extra-hard, each larger and denser than the one before", () => {
    expect(LEVELS).toEqual(["easy", "medium", "hard", "extra-hard"]);
    for (let i = 1; i < LEVELS.length; i += 1) {
      const before = LEVEL_SIZES[LEVELS[i - 1]!], level = LEVEL_SIZES[LEVELS[i]!];
      expect(level.width * level.height).toBeGreaterThan(before.width * before.height);
      expect(level.mines / (level.width * level.height)).toBeGreaterThan(before.mines / (before.width * before.height));
    }
    expect(LEVEL_SIZES["extra-hard"]).toEqual({ width: 40, height: 24, mines: 240 });
  });
  it("are also presets, and the old names are the first three of them", () => {
    for (const level of LEVELS) expect(PRESETS[level]).toEqual(LEVEL_SIZES[level]);
    expect(LEVEL_ALIASES).toEqual({ beginner: "easy", intermediate: "medium", expert: "hard" });
    for (const [alias, level] of Object.entries(LEVEL_ALIASES)) expect(PRESETS[alias as keyof typeof LEVEL_ALIASES]).toEqual(LEVEL_SIZES[level]);
    expect({ ...DEFAULT_SETTINGS }).toMatchObject(PRESETS.easy);
  });
  it("are found by name, by old name and by any spelling of extra-hard", () => {
    for (const level of LEVELS) expect(levelNamed(level)).toBe(level);
    expect(levelNamed("beginner")).toBe("easy");
    expect(levelNamed("Intermediate")).toBe("medium");
    expect(levelNamed(" EXPERT ")).toBe("hard");
    for (const spelling of ["extra-hard", "Extra Hard", "extra_hard", "extraHard", "EXTRAHARD", "extra  hard"]) expect(levelNamed(spelling)).toBe("extra-hard");
  });
  it("are refused for anything that is not a level, including names every object has", () => {
    for (const name of ["", "wide", "tall", "custom", "extra", "__proto__", "constructor", "toString", "hasOwnProperty", null, undefined, 3, {}]) expect(levelNamed(name)).toBeNull();
    expect(() => levelSettings("wide" as never)).toThrow(RangeError);
  });
  it("give a rectangle the level's own size and mines, under the old names too", () => {
    expect(levelSettings("easy")).toEqual({ width: 9, height: 9, mines: 10 });
    expect(levelSettings("beginner")).toEqual(levelSettings("easy"));
    expect(levelSettings("expert", { grid: "hex" })).toEqual({ width: 30, height: 16, mines: 99 });
    expect(levelSettings("extra-hard", { grid: "wrap", shape: "rectangle" })).toEqual({ width: 40, height: 24, mines: 240 });
    const asked = levelSettings("easy"); asked.mines = 3;
    expect(LEVEL_SIZES.easy.mines).toBe(10);
  });
  for (const grid of Object.values(GRIDS) as Grid[]) for (const shape of SHAPES) {
    if (grid === "wrap" && shape !== "rectangle") continue;
    it(`are valid, in order of mines, on ${grid} ${shape}`, () => {
      let before = 0;
      for (const level of LEVELS) {
        const size = levelSettings(level, { grid, shape });
        const settings: Settings = { ...DEFAULT_SETTINGS, ...size, grid, shape };
        expect(validSettings(settings)).toBe(true);
        expect(size.mines).toBeGreaterThan(before);
        before = size.mines;
        if (shape !== "rectangle") {
          const cells = activeCells(settings).length, own = LEVEL_SIZES[level];
          expect(Math.abs(size.mines / cells - own.mines / (own.width * own.height))).toBeLessThan(0.08);
        }
      }
    });
  }
});

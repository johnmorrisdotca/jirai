import { describe, expect, it } from "vitest";
import { makeBoard } from "./generate.ts";
import { DEFAULT_SETTINGS, GRIDS, LEVELS } from "./jirai.constants.ts";
import { levelSettings } from "./levels.ts";
import { measureBoard } from "./measure.ts";
import type { Grid, Settings } from "./jirai.types.ts";

describe("the measure of a board", () => {
  it("reports what solving it took, and what it is made of", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, ...levelSettings("medium"), seed: 3 };
    const board = makeBoard(settings, 120);
    const measure = measureBoard(board);
    expect(measure.solvable).toBe(true);
    expect(measure.cells).toBe(256);
    expect(measure.density).toBeCloseTo(40 / 256, 10);
    expect(measure.opening).toBeGreaterThan(0);
    expect(measure.opening).toBeLessThan(1);
    const { count, overlap, total, enumeration } = measure.proofs;
    expect(count).toBeGreaterThan(0);
    expect(measure.multiStep).toBeCloseTo((overlap + total + enumeration) / 256, 10);
    expect(measure.depth).toBeGreaterThan(1);
    expect(measure.score).toBeGreaterThan(0);
    expect(measureBoard(board)).toEqual(measure);
  });
  it("says so when a field cannot be finished by deduction", () => {
    const board = makeBoard({ ...DEFAULT_SETTINGS, noGuess: false, width: 16, height: 16, mines: 70, seed: 1 }, 120);
    const measure = measureBoard(board);
    expect(measure.solvable).toBe(false);
  });
  for (const grid of Object.values(GRIDS) as Grid[]) it(`rises with every level on ${grid} fields, on average over ${6} seeds`, () => {
    const means = LEVELS.map((level) => {
      const size = levelSettings(level, { grid });
      let sum = 0;
      for (let seed = 1; seed <= 6; seed += 1) {
        const settings: Settings = { ...DEFAULT_SETTINGS, ...size, grid, seed };
        sum += measureBoard(makeBoard(settings, Math.floor(size.height / 2) * size.width + Math.floor(size.width / 2))).score;
      }
      return sum / 6;
    });
    for (let i = 1; i < means.length; i += 1) expect(means[i]).toBeGreaterThan(means[i - 1]! * 1.2);
  });
});

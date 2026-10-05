import { expect, it } from "vitest";
import { deduce, hintFor } from "./deduce.ts";
import { enumerateForced } from "./enumerate.ts";
import { DEFAULT_SETTINGS, MARKS, STATUSES } from "./jirai.constants.ts";
import { neighbours } from "./grid.ts";
import type { VisibleGame, Grid } from "./jirai.types.ts";

it("extracts the 1–2–1 wall pattern without trusting flags", () => {
  const game: VisibleGame = {
    settings: { ...DEFAULT_SETTINGS, width: 3, height: 3, mines: 2 }, status: STATUSES.playing,
    clues: [null,null,null,1,2,1,0,0,0], marks: [MARKS.flag,MARKS.flag,MARKS.covered,...Array(6).fill(MARKS.open)],
  };
  const hint = hintFor(game);
  expect(hint.safe).toContain(1); // A wrongly flagged square is still provably safe.
});

it("enumeration proves only cells forced in every consistent assignment", () => {
  const proof = enumerateForced([
    { cells: [0,1], mines: 1, sources: [3] },
    { cells: [1,2], mines: 1, sources: [4] },
    { cells: [0,2], mines: 0, sources: [5] },
  ]);
  expect([...proof.safe].sort()).toEqual([0,2]); expect(proof.mines).toEqual([1]);
  expect(enumerateForced([{ cells: [0,1], mines: 1, sources: [] }]).safe).toEqual([]);
  expect(enumerateForced([{ cells: [0], mines: 2, sources: [] }]).contradiction).toBe(true);
});

it("agrees with an independent exhaustive oracle on square, hex and wrapped 3×3 positions", () => {
  for (const grid of ["square", "hex", "wrap"] as Grid[]) {
    const settings = { ...DEFAULT_SETTINGS, width: 3, height: 3, mines: 2, grid };
    for (let firstMine = 0; firstMine < 9; firstMine += 1) for (let secondMine = firstMine + 1; secondMine < 9; secondMine += 1) {
      const actual = [firstMine, secondMine];
      const clues = Array.from({ length: 9 }, (_, cell) => !actual.includes(cell) && cell % 2 === 0 ? neighbours(settings, cell).filter((n) => actual.includes(n)).length : null);
      const possible: number[][] = [];
      for (let a = 0; a < 9; a += 1) for (let b = a + 1; b < 9; b += 1) {
        const mines = [a,b];
        if (mines.some((cell) => clues[cell] !== null)) continue;
        if (clues.every((clue, cell) => clue === null || neighbours(settings, cell).filter((n) => mines.includes(n)).length === clue)) possible.push(mines);
      }
      const game: VisibleGame = { settings, clues, status: STATUSES.playing, marks: clues.map((n) => n === null ? MARKS.flag : MARKS.open) };
      const result = deduce(game);
      expect(result.contradiction).toBe(false); expect(possible.length).toBeGreaterThan(0);
      for (const cell of result.safe) expect(possible.every((mines) => !mines.includes(cell))).toBe(true);
      for (const cell of result.mines) expect(possible.every((mines) => mines.includes(cell))).toBe(true);
    }
  }
});

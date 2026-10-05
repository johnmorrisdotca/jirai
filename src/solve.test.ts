import { describe, expect, it } from "vitest";
import { deduce, hintFor } from "./deduce.ts";
import { flood } from "./flood.ts";
import { isSolvable, makeBoard } from "./generate.ts";
import { newGame, play, visibleGame } from "./game.ts";
import { neighboursOf } from "./grid.ts";
import { DEFAULT_SETTINGS, GRIDS, MARKS, STATUSES } from "./jirai.constants.ts";
import { seededRandom, shuffled } from "./random.ts";
import { activeCell, activeCells } from "./shape.ts";
import { Solver } from "./solve.ts";
import type { Board, Grid, Settings, VisibleGame } from "./jirai.types.ts";

/** What 0.2.1 did to decide a board: ask `deduce` for one deduction at a time and apply it. The fast solver must agree with this. */
function referenceSolvable(board: Board, enumerate = true): boolean {
  const adjacent = neighboursOf(board.settings);
  const open = board.clues.map(() => false);
  const known = new Set<number>();
  flood(board.clues, adjacent, open, [board.first]);
  while (open.filter(Boolean).length < activeCells(board.settings).length - board.settings.mines) {
    const visible: VisibleGame = {
      settings: board.settings, clues: board.clues.map((n, cell) => activeCell(board.settings, cell) ? open[cell] ? n : null : -2),
      marks: open.map((yes) => yes ? MARKS.open : MARKS.covered), status: STATUSES.playing,
    };
    const result = deduce(visible, known, enumerate);
    if (result.contradiction) return false;
    let changed = false;
    for (const cell of result.mines) if (!known.has(cell)) { known.add(cell); changed = true; }
    if (result.safe.some((cell) => !open[cell])) { flood(board.clues, adjacent, open, result.safe); changed = true; }
    if (!changed) return false;
  }
  return true;
}

/** A random layout, dealt as a game would, with no promise of being solvable. */
function layout(settings: Settings, first: number): Board {
  return makeBoard({ ...settings, noGuess: false }, first);
}

describe("the fast solver", () => {
  for (const grid of Object.values(GRIDS) as Grid[]) it(`agrees with deduce on ${grid} fields, solvable and not, with and without enumeration`, () => {
    const random = seededRandom(7);
    let solvable = 0, stuck = 0;
    for (const [width, height, density] of [[10, 10, 0.16], [12, 9, 0.24], [14, 10, 0.32]] as const) {
      for (let i = 0; i < 24; i += 1) {
        const settings: Settings = { ...DEFAULT_SETTINGS, width, height, grid, mines: Math.round(width * height * density), seed: 1 + Math.floor(random() * 1e6) };
        const board = layout(settings, Math.floor(height / 2) * width + Math.floor(width / 2));
        for (const enumerate of [true, false]) {
          const expected = referenceSolvable(board, enumerate);
          expect(isSolvable(board, enumerate)).toBe(expected);
          if (enumerate) { if (expected) solvable += 1; else stuck += 1; }
        }
      }
    }
    expect(solvable).toBeGreaterThan(3);
    expect(stuck).toBeGreaterThan(3);
  });
  it("agrees with deduce on boards one mine away from solved, where the answer is least obvious", () => {
    const random = seededRandom(31);
    let agreed = 0;
    for (const grid of Object.values(GRIDS) as Grid[]) for (let seed = 1; seed <= 4; seed += 1) {
      const settings: Settings = { ...DEFAULT_SETTINGS, width: 13, height: 11, grid, mines: 38, seed };
      const first = 71;
      const board = makeBoard(settings, first);
      const adjacent = neighboursOf(settings);
      for (let k = 0; k < 6; k += 1) {
        const mines = [...board.mines];
        const taken = shuffled(mines.flatMap((m, c) => m ? [c] : []), random)[0]!;
        const given = shuffled(mines.flatMap((m, c) => !m && Math.abs(c - first) > 14 ? [c] : []), random)[0]!;
        mines[taken] = false; mines[given] = true;
        const clues = mines.map((mine, cell) => mine ? -1 : adjacent[cell]!.filter((n) => mines[n]).length);
        if (clues[first] !== 0) continue;
        const moved: Board = { ...board, mines, clues };
        expect(isSolvable(moved)).toBe(referenceSolvable(moved));
        agreed += 1;
      }
    }
    expect(agreed).toBeGreaterThan(30);
  });
  it("is the hint engine's own proof: following hintFor, every field it dealt is finished without a guess", () => {
    for (const grid of Object.values(GRIDS) as Grid[]) {
      const settings: Settings = { ...DEFAULT_SETTINGS, width: 20, height: 12, grid, mines: 60, seed: 5 };
      const first = 6 * 20 + 10;
      let game = play(newGame(settings), { kind: "reveal", cell: first });
      for (let rounds = 0; game.status === STATUSES.playing && rounds < 400; rounds += 1) {
        const hint = hintFor(visibleGame(game));
        expect(hint.contradiction).toBe(false);
        expect(hint.safe.length).toBeGreaterThan(0);
        for (const cell of hint.safe) { expect(game.board!.mines[cell]).toBe(false); game = play(game, { kind: "reveal", cell }); }
      }
      expect(game.status).toBe(STATUSES.won);
    }
  });
  it("can be run again and again on one set of settings, and a run leaves nothing behind for the next", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, width: 16, height: 16, mines: 40, seed: 3 };
    const solver = new Solver(settings);
    const board = makeBoard(settings, 120);
    const clues = Int8Array.from(board.clues);
    const first = solver.run(clues, 120);
    const second = solver.run(clues, 120);
    expect(first.solved).toBe(true);
    expect(second).toEqual(first);
    const empty = solver.run(Int8Array.from(board.clues).fill(-1), 120);
    expect(empty.solved).toBe(false);
  });
  it("opens nothing from a mine and counts what it proved by kind", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, width: 16, height: 16, mines: 40, seed: 3 };
    const board = makeBoard(settings, 120);
    const solver = new Solver(settings);
    const mine = board.mines.indexOf(true);
    expect(solver.run(Int8Array.from(board.clues), mine).solved).toBe(false);
    const report = solver.run(Int8Array.from(board.clues), 120);
    expect(report.free).toBeGreaterThan(0);
    expect(report.opened).toBe(256 - 40);
    expect(report.proved.count).toBeGreaterThan(0);
    expect(report.depth).toBeGreaterThan(1);
  });
});

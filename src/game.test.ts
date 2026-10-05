import { describe, expect, it } from "vitest";
import { newGame, play, visibleGame } from "./game.ts";
import { makeBoard, isSolvable, GenerationError } from "./generate.ts";
import { DEFAULT_SETTINGS, GRIDS, MARKS, MOVES, STATUSES } from "./jirai.constants.ts";
import { neighbours, neighboursOf, validCell, validSettings } from "./grid.ts";
import { gameFromProgress, gameProgress, dailySeed } from "./keep.ts";
import { boardModel } from "./draw.ts";
import { hintFor } from "./deduce.ts";
import type { Board, Game, Settings } from "./jirai.types.ts";
import { decodeOrthogonalGame, encodeOrthogonalGame, makeOrthogonalBoard, newOrthogonalGame, orthogonalHint, orthogonalNeighbours } from "./orthogonal.ts";

function fixedGame(minesAt: number[]): Game {
  const settings: Settings = { ...DEFAULT_SETTINGS, width: 5, height: 5, mines: minesAt.length, noGuess: false, opening: "safe" };
  const mines = Array.from({ length: 25 }, (_, cell) => minesAt.includes(cell));
  const clues = mines.map((mine, cell) => mine ? -1 : neighbours(settings, cell).filter((n) => mines[n]).length);
  const board: Board = { settings, mines, clues, first: 12, attempt: 0 };
  return { ...newGame(settings), board };
}

describe("the grid topologies", () => {
  for (const grid of Object.values(GRIDS)) it(`${grid} has reciprocal, unique neighbours and no self-neighbours`, () => {
    const settings = { ...DEFAULT_SETTINGS, width: 7, height: 5, grid };
    const all = neighboursOf(settings);
    for (let cell = 0; cell < all.length; cell += 1) {
      expect(new Set(all[cell]).size).toBe(all[cell]!.length);
      expect(all[cell]).not.toContain(cell);
      for (const n of all[cell]!) expect(all[n]).toContain(cell);
    }
  });
  it("uses four orthogonal neighbours, six hex neighbours, eight square neighbours, and joins both wrap seams", () => {
    expect(neighbours({ ...DEFAULT_SETTINGS, grid: GRIDS.orthogonal }, 40)).toHaveLength(4);
    expect(neighbours({ ...DEFAULT_SETTINGS, grid: GRIDS.hex }, 40)).toHaveLength(6);
    expect(neighbours(DEFAULT_SETTINGS, 40)).toHaveLength(8);
    expect(neighbours({ ...DEFAULT_SETTINGS, grid: GRIDS.wrap }, 0)).toEqual([1,8,9,10,17,72,73,80]);
  });
  it("uses only orthogonal clues, preserves playable voids, and verifies a no-guess deal", () => {
    const settings = { ...DEFAULT_SETTINGS, width: 9, height: 9, mines: 10, grid: GRIDS.orthogonal, seed: 19 };
    const board = makeBoard(settings, 40);
    expect(board.clues[40]).toBe(0);
    for (let cell = 0; cell < 81; cell += 1) {
      expect(board.clues[cell]).toBe(board.mines[cell] ? -1 : neighbours(settings, cell).filter(next => board.mines[next]).length);
    }
    expect(isSolvable(board)).toBe(true);
    const shaped = { ...settings, shape: "heart" as const };
    const shapedBoard = makeBoard(shaped, 40);
    for (let cell = 0; cell < 81; cell += 1) if (!validCell(shaped, cell)) {
      expect(shapedBoard.mines[cell]).toBe(false);
      expect(shapedBoard.clues[cell]).toBe(-2);
      expect(neighbours(shaped, cell)).toEqual([]);
    }
    const playing = play(newGame(settings), { kind: MOVES.reveal, cell: 40 });
    const proof = hintFor(visibleGame(playing));
    expect(proof.safe.every(cell => !playing.board!.mines[cell])).toBe(true);
    expect(proof.mines.every(cell => playing.board!.mines[cell])).toBe(true);
  });
  it("rejects malformed or excessive settings before making a board", () => {
    for (const change of [{ width: 1 }, { width: 61 }, { width: 60, height: 60 }, { mines: 81 }, { seed: NaN }, { grid: "__proto__" }, { mines: 1.5 }, { noGuess: "yes" }]) expect(validSettings({ ...DEFAULT_SETTINGS, ...change })).toBe(false);
  });
});

describe("dealing and verified boards", () => {
  for (const grid of Object.values(GRIDS)) it(`${grid} deals exact counts and a clear first opening for many seeds`, () => {
    for (let seed = 0; seed < 40; seed += 1) {
      const settings = { ...DEFAULT_SETTINGS, grid, seed, noGuess: false };
      const board = makeBoard(settings, 40);
      expect(board.mines.filter(Boolean)).toHaveLength(10);
      expect(board.clues[40]).toBe(0);
      for (let cell = 0; cell < 81; cell += 1) {
        expect(board.clues[cell]).toBe(board.mines[cell] ? -1 : neighbours(settings, cell).filter((n) => board.mines[n]).length);
      }
      expect(makeBoard(settings, 40)).toEqual(board);
    }
  });
  for (const grid of Object.values(GRIDS)) it(`${grid} only advertises boards its visible-clue solver actually finishes`, () => {
    for (let seed = 0; seed < 15; seed += 1) expect(isSolvable(makeBoard({ ...DEFAULT_SETTINGS, grid, seed }, 40))).toBe(true);
  });
  it("reports a failed proof budget rather than returning an unverified board", () => {
    let failures = 0;
    for (let seed = 0; seed < 50; seed += 1) {
      try { makeBoard({ ...DEFAULT_SETTINGS, width: 5, height: 5, mines: 10, opening: "safe", seed }, 12, { attempts: 1 }); }
      catch (error) { expect(error).toBeInstanceOf(GenerationError); expect((error as GenerationError).code).toBe("exhausted"); failures += 1; }
    }
    expect(failures).toBeGreaterThan(0);
  });
  it("rejects a dense board that cannot protect the chosen opening", () => {
    expect(() => makeBoard({ ...DEFAULT_SETTINGS, width: 3, height: 3, mines: 1 }, 4)).toThrow(GenerationError);
  });
});

describe("moves", () => {
  it("floods empty ground and wins without requiring any flags", () => {
    const game = fixedGame([0]);
    const before = structuredClone(game);
    const next = play(game, { kind: MOVES.reveal, cell: 24 });
    expect(next.status).toBe(STATUSES.won);
    expect(next.marks.filter((mark) => mark === MARKS.open)).toHaveLength(24);
    expect(game).toEqual(before);
  });
  it("does not open a flagged cell, including inside a flood", () => {
    let game = fixedGame([0]);
    game = play(game, { kind: MOVES.mark, cell: 24 });
    expect(play(game, { kind: MOVES.reveal, cell: 24 })).toBe(game);
    game = play(game, { kind: MOVES.reveal, cell: 20 });
    expect(game.marks[24]).toBe(MARKS.flag);
    expect(game.status).toBe(STATUSES.playing);
  });
  it("cycles notes through flag, question and covered", () => {
    let game = newGame();
    for (const mark of [MARKS.flag, MARKS.question, MARKS.covered]) { game = play(game, { kind: MOVES.mark, cell: 0 }); expect(game.marks[0]).toBe(mark); }
    expect(game.board).toBeNull();
  });
  it("chords a matched number and loses if the flags were wrong", () => {
    let game = fixedGame([0,24]);
    game = play(game, { kind: MOVES.reveal, cell: 6 });
    expect(play(game, { kind: MOVES.chord, cell: 6 })).toBe(game);
    game = play(game, { kind: MOVES.mark, cell: 1 });
    game = play(game, { kind: MOVES.chord, cell: 6 });
    expect(game.status).toBe(STATUSES.lost); expect(game.exploded).toBe(0);
    expect(play(game, { kind: MOVES.mark, cell: 3 })).toBe(game);
  });
  it("chords correctly flagged mines without revealing them", () => {
    let game = fixedGame([0,24]);
    game = play(game, { kind: MOVES.reveal, cell: 6 });
    game = play(game, { kind: MOVES.mark, cell: 0 });
    game = play(game, { kind: MOVES.chord, cell: 6 });
    expect(game.status).not.toBe(STATUSES.lost); expect(game.marks[0]).toBe(MARKS.flag);
  });
  it("keeps hidden answers out of both the clue view and drawing", () => {
    const game = fixedGame([0,24]);
    expect(visibleGame(game).clues.every((clue) => clue === null)).toBe(true);
    expect(boardModel(game).cells.every((cell) => cell.text === "" && cell.kind === MARKS.covered)).toBe(true);
  });
  it("replays a saved game from its seed and moves; malformed records are refused", () => {
    let game = newGame({ ...DEFAULT_SETTINGS, noGuess: false });
    game = play(game, { kind: MOVES.mark, cell: 0 }); game = play(game, { kind: MOVES.reveal, cell: 40 });
    expect(gameFromProgress(gameProgress(game))).toEqual(game);
    for (const data of ["garbage", "null", '{"version":2}', JSON.stringify({ version: 1, settings: DEFAULT_SETTINGS, moves: [{ kind: "reveal", cell: -1 }] })]) expect(gameFromProgress(data)).toBeNull();
  });
  it("keeps orthogonal save records distinct and preserves legacy square codes", () => {
    const legacy = JSON.stringify({ version: 1, settings: DEFAULT_SETTINGS, moves: [], helped: false });
    expect(gameFromProgress(legacy)).toEqual(newGame());
    const orthogonal = newGame({ ...DEFAULT_SETTINGS, grid: GRIDS.orthogonal });
    const code = gameProgress(orthogonal);
    expect(JSON.parse(code)).toMatchObject({ version: 2, variant: "orthogonal", settings: { grid: "orthogonal" } });
    expect(gameFromProgress(code)).toEqual(orthogonal);
    expect(gameFromProgress(JSON.stringify({ ...JSON.parse(code), variant: "square" }))).toBeNull();
  });
  it("exposes focused orthogonal helpers and variant-only progress codes", () => {
    const settings = { ...DEFAULT_SETTINGS, width: 9, height: 9, mines: 10, seed: 4 };
    const game = newOrthogonalGame(settings);
    expect(game.settings.grid).toBe("orthogonal");
    expect(orthogonalNeighbours(settings, 40)).toHaveLength(4);
    expect(makeOrthogonalBoard(settings, 40).settings.grid).toBe("orthogonal");
    expect(orthogonalHint(play(game, { kind: MOVES.reveal, cell: 40 })).contradiction).toBe(false);
    expect(decodeOrthogonalGame(encodeOrthogonalGame(game))).toEqual(game);
    expect(decodeOrthogonalGame(gameProgress(newGame()))).toBeNull();
  });
  it("has stable daily seeds and rejects impossible calendar dates", () => {
    expect(dailySeed("2026-10-04")).toBe(dailySeed("2026-10-04"));
    expect(dailySeed("2026-10-04", "orthogonal")).not.toBe(dailySeed("2026-10-04"));
    expect(dailySeed("2026-10-04", "hex")).not.toBe(dailySeed("2026-10-04"));
    expect(() => dailySeed("2026-02-30")).toThrow();
  });
});

export { fixedGame };

it("keeps assisted status through public progress and rejects invalid assisted data", () => {
  const game = { ...newGame(), helped: true };
  expect(gameFromProgress(gameProgress(game))?.helped).toBe(true);
  expect(gameFromProgress(JSON.stringify({ version: 1, settings: game.settings, moves: [], helped: "yes" }))).toBeNull();
});

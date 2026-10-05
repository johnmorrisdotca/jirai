import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, PRESETS } from "./jirai.constants.ts";
import { makeBoard } from "./generate.ts";
import { newGame, play } from "./game.ts";
import { gameFromProgress, gameProgress } from "./keep.ts";
import type { Grid } from "./jirai.types.ts";

/** Boards dealt by 0.2.1, written down from that release: the same seed must keep dealing the same field. */
const DEALT_BY_0_2_1: { grid: Grid; width: number; height: number; mines: number; seed: number; first: number; attempt: number; at: number[] }[] = [
  { grid: "square", width: 9, height: 9, mines: 10, seed: 1, first: 40, attempt: 0, at: [22,24,25,37,38,44,58,73,75,79] },
  { grid: "square", width: 9, height: 9, mines: 10, seed: 2, first: 40, attempt: 0, at: [4,13,17,21,34,38,69,70,71,73] },
  { grid: "orthogonal", width: 9, height: 9, mines: 10, seed: 3, first: 40, attempt: 0, at: [1,3,4,6,22,27,56,63,66,73] },
  { grid: "hex", width: 9, height: 9, mines: 10, seed: 4, first: 40, attempt: 0, at: [6,8,11,44,47,53,55,57,70,80] },
  { grid: "wrap", width: 9, height: 9, mines: 10, seed: 5, first: 40, attempt: 0, at: [1,6,9,11,18,37,43,55,62,77] },
  { grid: "square", width: 16, height: 16, mines: 40, seed: 11, first: 120, attempt: 0, at: [2,3,7,14,16,22,24,25,30,32,39,42,44,56,57,67,73,79,97,106,115,123,127,128,131,156,163,169,171,191,206,213,216,219,220,222,229,230,250,251] },
  { grid: "hex", width: 16, height: 16, mines: 40, seed: 5, first: 130, attempt: 0, at: [5,9,11,34,35,37,39,42,44,51,56,62,75,80,90,94,96,97,107,125,136,138,147,148,155,157,168,172,177,184,185,189,199,209,217,220,231,237,240,243] },
  { grid: "orthogonal", width: 16, height: 16, mines: 40, seed: 7, first: 136, attempt: 7, at: [4,16,23,32,34,43,59,66,71,82,94,95,105,107,108,113,122,132,139,140,144,149,158,162,165,174,185,187,191,194,196,201,202,204,206,220,221,247,249,251] },
  { grid: "wrap", width: 16, height: 16, mines: 40, seed: 9, first: 0, attempt: 0, at: [6,8,11,25,28,30,34,36,43,58,59,63,73,75,77,78,79,84,85,86,89,93,110,116,117,131,140,146,152,155,159,170,174,187,196,200,224,229,237,249] },
  { grid: "square", width: 30, height: 16, mines: 99, seed: 3, first: 255, attempt: 3, at: [4,11,15,25,37,41,64,69,72,80,91,92,98,100,103,104,115,117,121,125,127,130,136,137,144,147,149,150,152,153,158,159,162,170,172,176,187,188,192,193,194,200,206,212,213,221,239,250,258,260,267,268,269,271,273,274,275,278,294,301,308,309,311,312,320,324,327,328,331,334,336,342,344,350,351,353,359,377,385,389,392,395,403,416,417,424,433,436,437,440,443,445,454,458,466,467,476,477,478] },
];

/** A game saved by 0.2.1: a hexagonal field, thirteen moves in. */
const SAVED_BY_0_2_1 = '{"version":1,"settings":{"width":16,"height":16,"mines":40,"grid":"hex","noGuess":true,"opening":"clear","seed":5},"moves":[{"kind":"reveal","cell":130},{"kind":"reveal","cell":66},{"kind":"reveal","cell":50},{"kind":"reveal","cell":65},{"kind":"reveal","cell":81},{"kind":"reveal","cell":49},{"kind":"reveal","cell":33},{"kind":"reveal","cell":17},{"kind":"reveal","cell":20},{"kind":"reveal","cell":21},{"kind":"reveal","cell":36},{"kind":"reveal","cell":6},{"kind":"reveal","cell":7}],"helped":false}';

describe("what 0.2.1 dealt and saved", () => {
  for (const one of DEALT_BY_0_2_1) it(`${one.grid} ${one.width}×${one.height}, seed ${one.seed}, is dealt the same field`, () => {
    const board = makeBoard({ ...DEFAULT_SETTINGS, width: one.width, height: one.height, mines: one.mines, grid: one.grid, seed: one.seed }, one.first);
    expect(board.mines.flatMap((mine, cell) => mine ? [cell] : [])).toEqual(one.at);
    expect(board.attempt).toBe(one.attempt);
  });
  it("replays a saved game to the same position and saves it back unchanged", () => {
    const game = gameFromProgress(SAVED_BY_0_2_1);
    expect(game).not.toBeNull();
    expect(game!.status).toBe("playing");
    expect(game!.marks.filter((mark) => mark === "open")).toHaveLength(114);
    expect(game!.moves).toHaveLength(13);
    expect(gameProgress(game!)).toBe(SAVED_BY_0_2_1);
    expect(play(newGame(game!.settings), { kind: "reveal", cell: 130 }).board).toEqual(game!.board);
  });
  it("keeps the old preset names, with the numbers they always had", () => {
    expect(PRESETS.beginner).toEqual({ width: 9, height: 9, mines: 10 });
    expect(PRESETS.intermediate).toEqual({ width: 16, height: 16, mines: 40 });
    expect(PRESETS.expert).toEqual({ width: 30, height: 16, mines: 99 });
    expect(PRESETS.wide).toEqual({ width: 21, height: 9, mines: 24 });
    expect(PRESETS.tall).toEqual({ width: 9, height: 21, mines: 24 });
    expect(DEFAULT_SETTINGS).toEqual({ width: 9, height: 9, mines: 10, grid: "square", noGuess: true, opening: "clear", seed: 1 });
  });
});

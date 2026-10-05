import { describe, expect, it } from "vitest";
import { activeCell, activeCells } from "./shape.ts";
import { DEFAULT_SETTINGS, GRIDS } from "./jirai.constants.ts";
import { neighboursOf, validSettings } from "./grid.ts";
import { makeBoard, isSolvable } from "./generate.ts";
import { newGame, play, visibleGame } from "./game.ts";
import { boardModel } from "./draw.ts";
import { gameFromProgress, gameProgress } from "./keep.ts";
import type { Settings } from "./jirai.types.ts";

describe("shaped minefields", () => {
  for (const shape of ["heart", "star", "hexagon"] as const) for (const grid of [GRIDS.square, GRIDS.hex]) {
    it(`${shape}/${grid} omits cells and retains reciprocal neighbours and proved deals`, () => {
      const settings: Settings = { ...DEFAULT_SETTINGS, width: 17, height: 17, mines: 12, shape, grid };
      for (const outside of [-1, 289, 1.5, NaN]) expect(activeCell(settings, outside)).toBe(false);
      const cells = activeCells(settings), adjacent = neighboursOf(settings);
      expect(cells.length).toBeGreaterThan(40); expect(cells.length).toBeLessThan(289);
      for (const c of cells) for (const n of adjacent[c]!) {
        expect(activeCell(settings, n)).toBe(true); expect(adjacent[n]).toContain(c);
      }
      const first = cells[Math.floor(cells.length / 2)]!;
      for (let seed = 1; seed <= 12; seed += 1) {
        const board = makeBoard({ ...settings, seed }, first);
        expect(board.mines.filter(Boolean)).toHaveLength(12); expect(isSolvable(board)).toBe(true);
        for (let c = 0; c < 289; c += 1) if (!activeCell(settings, c)) {
          expect(board.mines[c]).toBe(false); expect(board.clues[c]).toBe(-2); expect(adjacent[c]).toEqual([]);
        }
      }
    });
  }
  it("never draws or lets the player act on cut-out cells, and restores the shape", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, width: 17, height: 17, shape: "heart", mines: 12 };
    let game = newGame(settings);
    const absent = Array.from({ length: 289 }, (_, c) => c).find(c => !activeCell(settings, c))!;
    expect(play(game, { kind: "reveal", cell: absent })).toBe(game);
    expect(play(game, { kind: "mark", cell: absent })).toBe(game);
    expect(visibleGame(game).clues[absent]).toBe(-2);
    expect(boardModel(game).cells.some(c => c.cell === absent)).toBe(false);
    game = play(game, { kind: "reveal", cell: activeCells(settings)[50]! });
    expect(gameFromProgress(gameProgress(game))?.settings.shape).toBe("heart");
  });
  it("wins when every active safe cell opens, without requiring absent cells", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, width: 9, height: 9, shape: "star", mines: 1, noGuess: false };
    let game = newGame(settings);
    const first = activeCells(settings)[10]!;
    game = play(game, { kind: "reveal", cell: first });
    for (const c of activeCells(settings)) if (!game.board!.mines[c]) game = play(game, { kind: "reveal", cell: c });
    expect(game.status).toBe("won");
  });
  it("rejects unknown outlines, tiny silhouettes, wrap cut-outs and excess mines", () => {
    expect(validSettings({ ...DEFAULT_SETTINGS, shape: "toString" })).toBe(false);
    expect(validSettings({ ...DEFAULT_SETTINGS, width: 5, height: 5, shape: "heart" })).toBe(false);
    expect(validSettings({ ...DEFAULT_SETTINGS, shape: "heart", grid: "wrap" })).toBe(false);
    expect(validSettings({ ...DEFAULT_SETTINGS, width: 9, height: 9, shape: "star", mines: 70 })).toBe(false);
  });
});

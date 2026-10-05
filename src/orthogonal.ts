import { deduce } from "./deduce.ts";
import { newGame, visibleGame } from "./game.ts";
import { makeBoard } from "./generate.ts";
import { neighbours, validSettings } from "./grid.ts";
import { gameFromProgress, gameProgress } from "./keep.ts";
import type { Board, GenerationOptions, Game, Settings } from "./jirai.types.ts";

/** Identifies the four-neighbour rules and progress-code format. */
export const ORTHOGONAL_VARIANT = "orthogonal" as const;
/** Settings accepted by the four-neighbour-specific helpers. */
export type OrthogonalSettings = Omit<Settings, "grid">;

/** Starts a game under four-neighbour rules. */
export function newOrthogonalGame(settings: OrthogonalSettings): Game {
  return newGame({ ...settings, grid: ORTHOGONAL_VARIANT });
}

/** Deals a board whose clues count only up, down, left and right. */
export function makeOrthogonalBoard(
  settings: OrthogonalSettings,
  first: number,
  options?: GenerationOptions,
): Board {
  return makeBoard({ ...settings, grid: ORTHOGONAL_VARIANT }, first, options);
}

/** Returns the adjacent cells under the orthogonal rules. */
export function orthogonalNeighbours(settings: OrthogonalSettings, cell: number): number[] {
  const complete = { ...settings, grid: ORTHOGONAL_VARIANT } as Settings;
  if (!validSettings(complete)) throw new RangeError("Invalid orthogonal settings.");
  return neighbours(complete, cell);
}

/** Gives a clue-only deduction; flags remain notes and cannot influence the result. */
export function orthogonalHint(game: Game) {
  if (game.settings.grid !== ORTHOGONAL_VARIANT) throw new RangeError("Expected an orthogonal game.");
  return deduce(visibleGame(game));
}

/** Encodes an orthogonal game with an explicit variant marker and version 2. */
export function encodeOrthogonalGame(game: Game): string {
  if (game.settings.grid !== ORTHOGONAL_VARIANT) throw new RangeError("Expected an orthogonal game.");
  return gameProgress(game);
}

/** Restores only version 2 orthogonal progress records. */
export function decodeOrthogonalGame(code: string): Game | null {
  const game = gameFromProgress(code);
  return game?.settings.grid === ORTHOGONAL_VARIANT ? game : null;
}

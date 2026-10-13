import { deduce } from "./deduce.ts";
import { newGame, visibleGame } from "./game.ts";
import { makeBoard } from "./generate.ts";
import { neighbours, validSettings } from "./grid.ts";
import { gameFromProgress, gameProgress } from "./keep.ts";
import type { Board, GenerationOptions, Game, Settings } from "./jirai.types.ts";

/** Identifies the four-neighbour rules and progress-code format.
 *
 * @example
 * ```ts
 * import { ORTHOGONAL_VARIANT } from "@johnmorrisdotca/jirai/orthogonal";
 *
 * console.log(ORTHOGONAL_VARIANT);
 * ```
 */
export const ORTHOGONAL_VARIANT = "orthogonal" as const;
/** Settings accepted by the four-neighbour-specific helpers.
 *
 * @example
 * ```ts
 * import type { OrthogonalSettings } from "@johnmorrisdotca/jirai/orthogonal";
 *
 * const orthogonalSettings: OrthogonalSettings={width:3,height:3,mines:1,noGuess:false,opening:"clear",seed:42};
 * const value: OrthogonalSettings = orthogonalSettings;
 * console.log(value);
 * ```
 */
export type OrthogonalSettings = Omit<Settings, "grid">;

/** Starts a game under four-neighbour rules.
 *
 * @param settings - The validated native field dimensions, mine count, topology, shape, opening, generation policy and numeric seed.
 * @returns Starts a game under four-neighbour rules.
 * @example
 * ```ts
 * import type { OrthogonalSettings } from "@johnmorrisdotca/jirai/orthogonal";
 * import { newOrthogonalGame } from "@johnmorrisdotca/jirai/orthogonal";
 *
 * const orthogonalSettings: OrthogonalSettings={width:3,height:3,mines:1,noGuess:false,opening:"clear",seed:42};
 * console.log(newOrthogonalGame(orthogonalSettings).status);
 * ```
 */
export function newOrthogonalGame(settings: OrthogonalSettings): Game {
  return newGame({ ...settings, grid: ORTHOGONAL_VARIANT });
}

/** Deals a board whose clues count only up, down, left and right.
 *
 * @param settings - The validated native field dimensions, mine count, topology, shape, opening, generation policy and numeric seed.
 * @param first - The native active-cell index of the opening, from which generation and proof begin.
 * @param options - The generation budgets/options, or React-owned native settings and host callbacks specified by this signature.
 * @returns Deals a board whose clues count only up, down, left and right.
 * @example
 * ```ts
 * import type { Settings } from "@johnmorrisdotca/jirai";
 * import type { OrthogonalSettings } from "@johnmorrisdotca/jirai/orthogonal";
 * import { makeOrthogonalBoard } from "@johnmorrisdotca/jirai/orthogonal";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const orthogonalSettings: OrthogonalSettings={width:3,height:3,mines:1,noGuess:false,opening:"clear",seed:42};
 * console.log(makeOrthogonalBoard(orthogonalSettings,0,{attempts:1,repair:false}).settings.grid);
 * ```
 */
export function makeOrthogonalBoard(
  settings: OrthogonalSettings,
  first: number,
  options?: GenerationOptions,
): Board {
  return makeBoard({ ...settings, grid: ORTHOGONAL_VARIANT }, first, options);
}

/** Returns the adjacent cells under the orthogonal rules.
 *
 * @param settings - The validated native field dimensions, mine count, topology, shape, opening, generation policy and numeric seed.
 * @param cell - An active native cell index in row-major board order.
 * @returns Returns the adjacent cells under the orthogonal rules.
 * @example
 * ```ts
 * import type { OrthogonalSettings } from "@johnmorrisdotca/jirai/orthogonal";
 * import { orthogonalNeighbours } from "@johnmorrisdotca/jirai/orthogonal";
 *
 * const orthogonalSettings: OrthogonalSettings={width:3,height:3,mines:1,noGuess:false,opening:"clear",seed:42};
 * console.log(orthogonalNeighbours(orthogonalSettings,0));
 * ```
 */
export function orthogonalNeighbours(settings: OrthogonalSettings, cell: number): number[] {
  const complete = { ...settings, grid: ORTHOGONAL_VARIANT } as Settings;
  if (!validSettings(complete)) throw new RangeError("Invalid orthogonal settings.");
  return neighbours(complete, cell);
}

/** Gives a clue-only deduction; flags remain notes and cannot influence the result.
 *
 * @param game - The native game, or answer-free VisibleGame required by the signature.
 * @returns Gives a clue-only deduction; flags remain notes and cannot influence the result.
 * @example
 * ```ts
 * import type { OrthogonalSettings } from "@johnmorrisdotca/jirai/orthogonal";
 * import { play } from "@johnmorrisdotca/jirai";
 * import { newOrthogonalGame, orthogonalHint } from "@johnmorrisdotca/jirai/orthogonal";
 *
 * const orthogonalSettings: OrthogonalSettings={width:3,height:3,mines:1,noGuess:false,opening:"clear",seed:42};
 * const orthogonalGame=play(newOrthogonalGame(orthogonalSettings),{kind:"reveal",cell:0});
 * console.log(orthogonalHint(orthogonalGame));
 * ```
 */
export function orthogonalHint(game: Game) {
  if (game.settings.grid !== ORTHOGONAL_VARIANT) throw new RangeError("Expected an orthogonal game.");
  return deduce(visibleGame(game));
}

/** Encodes an orthogonal game with an explicit variant marker and version 2.
 *
 * @param game - The native game, or answer-free VisibleGame required by the signature.
 * @returns Encodes an orthogonal game with an explicit variant marker and version 2.
 * @example
 * ```ts
 * import type { OrthogonalSettings } from "@johnmorrisdotca/jirai/orthogonal";
 * import { play } from "@johnmorrisdotca/jirai";
 * import { encodeOrthogonalGame, newOrthogonalGame } from "@johnmorrisdotca/jirai/orthogonal";
 *
 * const orthogonalSettings: OrthogonalSettings={width:3,height:3,mines:1,noGuess:false,opening:"clear",seed:42};
 * const orthogonalGame=play(newOrthogonalGame(orthogonalSettings),{kind:"reveal",cell:0});
 * console.log(encodeOrthogonalGame(orthogonalGame));
 * ```
 */
export function encodeOrthogonalGame(game: Game): string {
  if (game.settings.grid !== ORTHOGONAL_VARIANT) throw new RangeError("Expected an orthogonal game.");
  return gameProgress(game);
}

/** Restores only version 2 orthogonal progress records.
 *
 * @param code - A saved orthogonal game string to validate and replay.
 * @returns The validated orthogonal game, or null for invalid data or a different variant.
 * @example
 * ```ts
 * import type { OrthogonalSettings } from "@johnmorrisdotca/jirai/orthogonal";
 * import { play } from "@johnmorrisdotca/jirai";
 * import { decodeOrthogonalGame, encodeOrthogonalGame, newOrthogonalGame } from "@johnmorrisdotca/jirai/orthogonal";
 *
 * const orthogonalSettings: OrthogonalSettings={width:3,height:3,mines:1,noGuess:false,opening:"clear",seed:42};
 * const orthogonalGame=play(newOrthogonalGame(orthogonalSettings),{kind:"reveal",cell:0});
 * console.log(decodeOrthogonalGame(encodeOrthogonalGame(orthogonalGame))?.status);
 * ```
 */
export function decodeOrthogonalGame(code: string): Game | null {
  const game = gameFromProgress(code);
  return game?.settings.grid === ORTHOGONAL_VARIANT ? game : null;
}

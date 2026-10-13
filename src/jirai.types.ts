/** Neighbour topology used to count the clues around each cell.
 *
 * @example
 * ```ts
 * import type { Grid } from "@johnmorrisdotca/jirai";
 *
 * const value: Grid = "orthogonal";
 * console.log(value);
 * ```
 */
export type Grid = "square" | "orthogonal" | "hex" | "wrap";
/** A difficulty level: easy, medium, hard or extra-hard.
 *
 * @example
 * ```ts
 * import type { Level } from "@johnmorrisdotca/jirai";
 *
 * const value: Level = "extra-hard";
 * console.log(value);
 * ```
 */
export type Level = "easy" | "medium" | "hard" | "extra-hard";
/** The 0.1 and 0.2 names for easy, medium and hard, still accepted wherever a level is.
 *
 * @example
 * ```ts
 * import type { LevelAlias } from "@johnmorrisdotca/jirai";
 *
 * const value: LevelAlias = "beginner";
 * console.log(value);
 * ```
 */
export type LevelAlias = "beginner" | "intermediate" | "expert";
/** Current game state, including whether a mine has been hit.
 *
 * @example
 * ```ts
 * import type { Status } from "@johnmorrisdotca/jirai";
 *
 * const value: Status = "ready";
 * console.log(value);
 * ```
 */
export type Status = "ready" | "playing" | "won" | "lost";
/** Player-facing state of one cell; the answer is never a mark.
 *
 * @example
 * ```ts
 * import type { Mark } from "@johnmorrisdotca/jirai";
 *
 * const value: Mark = "covered";
 * console.log(value);
 * ```
 */
export type Mark = "covered" | "flag" | "question" | "open";
/** Board dimensions and rules used to deal and validate a game.
 *
 * @example
 * ```ts
 * import type { Settings } from "@johnmorrisdotca/jirai";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const value: Settings = settings;
 * console.log(value);
 * ```
 */
export type Settings = {
  /** Shape omits cells; rectangle is the compatible default. Wrap requires rectangle. */
  shape?: "rectangle" | "heart" | "star" | "hexagon";
  width: number;
  height: number;
  mines: number;
  grid: Grid;
  /** Only accept boards the deduction solver finishes from the opening. */
  noGuess: boolean;
  /** The opening and every neighbour are safe, not only the first cell. */
  opening: "safe" | "clear";
  seed: number;
};
/** A reveal, mark-cycle, or numbered-cell chord applied to a game.
 *
 * @example
 * ```ts
 * import type { Move } from "@johnmorrisdotca/jirai";
 *
 * const value: Move = {kind:"reveal",cell:0};
 * console.log(value);
 * ```
 */
export type Move = { kind: "reveal" | "mark" | "chord"; cell: number };
/** A dealt board including its answer; keep it off public clients.
 *
 * @example
 * ```ts
 * import type { Board, Settings } from "@johnmorrisdotca/jirai";
 * import { makeBoard } from "@johnmorrisdotca/jirai";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const board=makeBoard(settings,0,{attempts:1,repair:false});
 * const value: Board = board;
 * console.log(value);
 * ```
 */
export type Board = {
  settings: Settings;
  mines: readonly boolean[];
  clues: readonly number[];
  first: number;
  /** Which candidate this deal was: below the `attempts` limit it is a random layout, at or above it a repaired one. */
  attempt: number;
};
/** Rules data includes the answer; never send it to a competitive client. Use visibleGame for hints and drawing.
 *
 * @example
 * ```ts
 * import type { Game, Settings } from "@johnmorrisdotca/jirai";
 * import { newGame, play } from "@johnmorrisdotca/jirai";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const game=play(newGame(settings),{kind:"reveal",cell:0});
 * const value: Game = game;
 * console.log(value);
 * ```
 */
export type Game = {
  settings: Settings;
  board: Board | null;
  marks: readonly Mark[];
  status: Status;
  exploded: number | null;
  moves: readonly Move[];
  /** A proved hint has been shown during this run. */
  helped: boolean;
};
/** Answer-free state suitable for deductions, hints, and public display.
 *
 * @example
 * ```ts
 * import type { Settings, VisibleGame } from "@johnmorrisdotca/jirai";
 * import { newGame, play, visibleGame } from "@johnmorrisdotca/jirai";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const game=play(newGame(settings),{kind:"reveal",cell:0});
 * const value: VisibleGame = visibleGame(game);
 * console.log(value);
 * ```
 */
export type VisibleGame = {
  settings: Settings;
  /** Null is hidden, including flags. Only opened cells give a clue. */
  clues: readonly (number | null)[];
  marks: readonly Mark[];
  status: Status;
};
/** An exact count over unknown cells, with the clues that supplied it.
 *
 * @example
 * ```ts
 * import type { Constraint } from "@johnmorrisdotca/jirai";
 *
 * const value: Constraint = {cells:[0,1],mines:1,sources:[2]};
 * console.log(value);
 * ```
 */
export type Constraint = { cells: readonly number[]; mines: number; sources: readonly number[] };
/** Certain safe cells and mines proved from visible clues.
 *
 * @example
 * ```ts
 * import type { Deduction, Settings } from "@johnmorrisdotca/jirai";
 * import { hintFor, newGame, play, visibleGame } from "@johnmorrisdotca/jirai";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const game=play(newGame(settings),{kind:"reveal",cell:0});
 * const value: Deduction = hintFor(visibleGame(game));
 * console.log(value);
 * ```
 */
export type Deduction = {
  safe: readonly number[];
  mines: readonly number[];
  reason: "count" | "overlap" | "total" | "enumeration" | "none";
  sources: readonly number[];
  /** A conflicting clue, or a board with no consistent mine placement. */
  contradiction: boolean;
};
/**
 * Work limits for seeded board generation and its no-guess check. `attempts` is the number of random layouts tried
 * first; `repairs` is how many single-mine moves the repair stage may try on the closest of them (0, or `repair:
 * false`, keeps the 0.2 behaviour of giving up after the attempts); `enumerate` switches the exact small-frontier check.
 *
 * @example
 * ```ts
 * import type { GenerationOptions } from "@johnmorrisdotca/jirai";
 *
 * const value: GenerationOptions = {attempts:1,repair:false,enumerate:true};
 * console.log(value);
 * ```
 */
export type GenerationOptions = { attempts?: number; repairs?: number; repair?: boolean; enumerate?: boolean };
/** Supported interface copy locales.
 *
 * @example
 * ```ts
 * import type { Language } from "@johnmorrisdotca/jirai";
 *
 * const value: Language = "ja";
 * console.log(value);
 * ```
 */
export type Language = "en" | "ja";
/** Board colours for drawing and mounted play.
 *
 * @example
 * ```ts
 * import type { Material } from "@johnmorrisdotca/jirai";
 *
 * const value: Material = "wood";
 * console.log(value);
 * ```
 */
export type Material = "ivory" | "wood" | "slate";
/** Symbols used to mark mines.
 *
 * @example
 * ```ts
 * import type { Pieces } from "@johnmorrisdotca/jirai";
 *
 * const value: Pieces = "flowers";
 * console.log(value);
 * ```
 */
export type Pieces = "flags" | "stones" | "flowers";

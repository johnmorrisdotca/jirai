/** Neighbour topology used to count the clues around each cell. */
export type Grid = "square" | "orthogonal" | "hex" | "wrap";
/** A difficulty level: easy, medium, hard or extra-hard. */
export type Level = "easy" | "medium" | "hard" | "extra-hard";
/** The 0.1 and 0.2 names for easy, medium and hard, still accepted wherever a level is. */
export type LevelAlias = "beginner" | "intermediate" | "expert";
/** Current game state, including whether a mine has been hit. */
export type Status = "ready" | "playing" | "won" | "lost";
/** Player-facing state of one cell; the answer is never a mark. */
export type Mark = "covered" | "flag" | "question" | "open";
/** Board dimensions and rules used to deal and validate a game. */
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
/** A reveal, mark-cycle, or numbered-cell chord applied to a game. */
export type Move = { kind: "reveal" | "mark" | "chord"; cell: number };
/** A dealt board including its answer; keep it off public clients. */
export type Board = {
  settings: Settings;
  mines: readonly boolean[];
  clues: readonly number[];
  first: number;
  /** Which candidate this deal was: below the `attempts` limit it is a random layout, at or above it a repaired one. */
  attempt: number;
};
/** Rules data includes the answer; never send it to a competitive client. Use visibleGame for hints and drawing. */
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
/** Answer-free state suitable for deductions, hints, and public display. */
export type VisibleGame = {
  settings: Settings;
  /** Null is hidden, including flags. Only opened cells give a clue. */
  clues: readonly (number | null)[];
  marks: readonly Mark[];
  status: Status;
};
/** An exact count over unknown cells, with the clues that supplied it. */
export type Constraint = { cells: readonly number[]; mines: number; sources: readonly number[] };
/** Certain safe cells and mines proved from visible clues. */
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
 */
export type GenerationOptions = { attempts?: number; repairs?: number; repair?: boolean; enumerate?: boolean };
/** Supported interface copy locales. */
export type Language = "en" | "ja";
/** Board colours for drawing and mounted play. */
export type Material = "ivory" | "wood" | "slate";
/** Symbols used to mark mines. */
export type Pieces = "flags" | "stones" | "flowers";

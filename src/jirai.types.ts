/** A cell's number is its row-major place on the board, starting at zero. */
export type Grid = "square" | "orthogonal" | "hex" | "wrap";
export type Status = "ready" | "playing" | "won" | "lost";
export type Mark = "covered" | "flag" | "question" | "open";
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
export type Move = { kind: "reveal" | "mark" | "chord"; cell: number };
export type Board = {
  settings: Settings;
  mines: readonly boolean[];
  clues: readonly number[];
  first: number;
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
export type VisibleGame = {
  settings: Settings;
  /** Null is hidden, including flags. Only opened cells give a clue. */
  clues: readonly (number | null)[];
  marks: readonly Mark[];
  status: Status;
};
export type Constraint = { cells: readonly number[]; mines: number; sources: readonly number[] };
export type Deduction = {
  safe: readonly number[];
  mines: readonly number[];
  reason: "count" | "overlap" | "total" | "enumeration" | "none";
  sources: readonly number[];
  /** A conflicting clue, or a board with no consistent mine placement. */
  contradiction: boolean;
};
export type GenerationOptions = { attempts?: number; enumerate?: boolean };
export type Language = "en" | "ja";
export type Material = "ivory" | "wood" | "slate";
export type Pieces = "flags" | "stones" | "flowers";

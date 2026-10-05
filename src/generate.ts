import { activeCell, activeCells } from "./shape.ts";
import { deduce } from "./deduce.ts";
import { flood } from "./flood.ts";
import { GENERATION_ATTEMPTS, MARKS, STATUSES } from "./jirai.constants.ts";
import { neighbours, neighboursOf, validCell, validSettings } from "./grid.ts";
import { seededRandom, shuffled } from "./random.ts";
import type { Board, GenerationOptions, Settings, VisibleGame } from "./jirai.types.ts";

/** A bounded generator must say it failed, never quietly return a guessing board. */
export class GenerationError extends Error {
  constructor(public readonly code: "settings" | "opening" | "exhausted", message: string) { super(message); this.name = "GenerationError"; }
}

/** Verify a board from one opening, using only clues that have been uncovered. */
export function isSolvable(board: Board, enumerate = true): boolean {
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
    for (const cell of result.mines) {
      if (!board.mines[cell]) return false;
      if (!known.has(cell)) { known.add(cell); changed = true; }
    }
    if (result.safe.some((cell) => board.mines[cell])) return false;
    if (result.safe.some((cell) => !open[cell])) { flood(board.clues, adjacent, open, result.safe); changed = true; }
    if (!changed) return false;
  }
  return true;
}

/** Deal after the first reveal. A seed fixes the whole candidate stream and the accepted board. */
export function makeBoard(settings: Settings, first: number, options: GenerationOptions = {}): Board {
  if (!validSettings(settings) || !validCell(settings, first)) throw new GenerationError("settings", "Invalid board settings or opening cell.");
  const protectedCells = new Set([first, ...(settings.opening === "clear" ? neighbours(settings, first) : [])]);
  const available = Array.from({ length: settings.width * settings.height }, (_, cell) => cell).filter((cell) => validCell(settings, cell) && !protectedCells.has(cell));
  if (available.length < settings.mines) throw new GenerationError("opening", "Too many mines for a safe opening at this cell.");
  const attempts = options.attempts ?? GENERATION_ATTEMPTS;
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 10_000) throw new GenerationError("settings", "Attempts must be between 1 and 10000.");
  const random = seededRandom(settings.seed);
  const adjacent = neighboursOf(settings);
  for (let attempt = 0; attempt < (settings.noGuess ? attempts : 1); attempt += 1) {
    const places = new Set(shuffled(available, random).slice(0, settings.mines));
    const mines = available.length ? Array.from({ length: settings.width * settings.height }, (_, cell) => places.has(cell)) : [];
    const clues = mines.map((mine, cell) => !activeCell(settings, cell) ? -2 : mine ? -1 : adjacent[cell]!.filter((n) => mines[n]).length);
    const board: Board = { settings: { ...settings }, mines, clues, first, attempt };
    if (!settings.noGuess || isSolvable(board, options.enumerate ?? true)) return board;
  }
  throw new GenerationError("exhausted", "No verified board found within the work budget. Try another seed, fewer mines, or a different opening.");
}

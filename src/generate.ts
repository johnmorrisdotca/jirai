import { activeCells } from "./shape.ts";
import { GENERATION_ATTEMPTS } from "./jirai.constants.ts";
import { neighbours, neighboursOf, validCell, validSettings } from "./grid.ts";
import { repair } from "./repair.ts";
import { seededRandom, shuffled } from "./random.ts";
import { Solver } from "./solve.ts";
import type { Board, GenerationOptions, Settings } from "./jirai.types.ts";

/** A bounded generator must say it failed, never quietly return a guessing board. */
export class GenerationError extends Error {
  constructor(public readonly code: "settings" | "opening" | "exhausted", message: string) { super(message); this.name = "GenerationError"; }
}

/** Verify a board from one opening, using only clues that have been uncovered. */
export function isSolvable(board: Board, enumerate = true): boolean {
  const solver = new Solver(board.settings);
  return solver.run(Int8Array.from(board.clues), board.first, enumerate).solved;
}

/** Layouts the repair stage may try, per cell of the field. */
const REPAIRS_PER_CELL = 12;

/**
 * Deal after the first reveal. A seed fixes the whole candidate stream and the accepted board.
 *
 * A no-guess deal first draws random layouts, as 0.1 and 0.2 did, so every board those versions dealt is still dealt.
 * If none of them can be finished by deduction it takes the closest and repairs it: single mines are moved near the
 * place the solver stopped until the solver finishes the whole field. The result is proved the same way either route.
 */
export function makeBoard(settings: Settings, first: number, options: GenerationOptions = {}): Board {
  if (!validSettings(settings) || !validCell(settings, first)) throw new GenerationError("settings", "Invalid board settings or opening cell.");
  const protectedCells = new Set([first, ...(settings.opening === "clear" ? neighbours(settings, first) : [])]);
  const available = activeCells(settings).filter((cell) => !protectedCells.has(cell));
  if (available.length < settings.mines) throw new GenerationError("opening", "Too many mines for a safe opening at this cell.");
  if (settings.noGuess && neighbours(settings, first).length === 0 && available.length > settings.mines)
    throw new GenerationError("opening", "The opening cell touches no other cell, so no clue can follow from it. Open another cell.");
  const attempts = options.attempts ?? GENERATION_ATTEMPTS;
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 10_000) throw new GenerationError("settings", "Attempts must be between 1 and 10000.");
  const repairs = options.repairs ?? (options.repair === false ? 0 : REPAIRS_PER_CELL * settings.width * settings.height);
  if (!Number.isInteger(repairs) || repairs < 0 || repairs > 1_000_000) throw new GenerationError("settings", "Repairs must be between 0 and 1000000.");
  const enumerate = options.enumerate ?? true;
  const random = seededRandom(settings.seed);
  const adjacent = neighboursOf(settings);
  const solver = new Solver(settings, adjacent);
  const cells = settings.width * settings.height;
  const layout = new Uint8Array(cells), clues = new Int8Array(cells);
  let best: Uint8Array | null = null, fewest = Infinity;
  const board = (attempt: number): Board => ({
    settings: { ...settings }, mines: Array.from(layout, Boolean), clues: Array.from(clues), first, attempt,
  });
  for (let attempt = 0; attempt < (settings.noGuess ? attempts : 1); attempt += 1) {
    layout.fill(0);
    for (const cell of shuffled(available, random).slice(0, settings.mines)) layout[cell] = 1;
    solver.clueFor(layout, clues);
    if (!settings.noGuess) return board(attempt);
    const report = solver.run(clues, first, enumerate);
    if (report.solved) return board(attempt);
    if (report.remaining < fewest) { fewest = report.remaining; best = layout.slice(); }
  }
  if (best !== null && repairs > 0) {
    // A cell no chain of neighbours reaches from the opening can never be told by a clue. Make each a mine and leave it
    // be: nobody has to find a mine to win, and nobody could find that one. Fewer mines than such cells: do not try.
    const reached = new Set([first]);
    for (const cell of reached) for (const n of adjacent[cell]!) reached.add(n);
    const stranded = available.filter((cell) => !reached.has(cell));
    if (stranded.length <= settings.mines) {
      const reachable = available.filter((cell) => reached.has(cell));
      const place = (): void => {
        layout.fill(0);
        for (const cell of stranded) layout[cell] = 1;
        for (const cell of shuffled(reachable, random).slice(0, settings.mines - stranded.length)) layout[cell] = 1;
        solver.clueFor(layout, clues);
      };
      // Begin from the closest of the random layouts, with the stranded cells made mines at the cost of other mines.
      layout.set(best);
      const movable = reachable.filter((cell) => layout[cell]);
      for (const cell of shuffled(stranded.filter((c) => !layout[c]), random)) { const from = movable.pop(); layout[from!] = 0; layout[cell] = 1; }
      solver.clueFor(layout, clues);
      const outcome = repair(solver, layout, clues, first, new Set([...protectedCells, ...stranded]), random, repairs, enumerate, place);
      if (outcome.solved) return board(attempts + outcome.tries);
    }
  }
  throw new GenerationError("exhausted", "No verified board found within the work budget. Try another seed, fewer mines, or a different opening.");
}

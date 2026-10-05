import { enumerateForced } from "./enumerate.ts";
import { neighboursOf } from "./grid.ts";
import type { Constraint, Deduction, VisibleGame } from "./jirai.types.ts";

/**
 * What the clues prove, without reading the answer or trusting a player's
 * flags. A flag is a note; treating it as evidence makes a bad note a bad hint.
 */
export function deduce(game: VisibleGame, knownMines: ReadonlySet<number> = new Set(), enumerate = true): Deduction {
  const adjacent = neighboursOf(game.settings);
  const constraints: Constraint[] = [];
  const empty: Deduction = { safe: [], mines: [], reason: "none", sources: [], contradiction: false };
  for (let cell = 0; cell < game.clues.length; cell += 1) {
    const clue = game.clues[cell];
    if (clue === null || clue === undefined || clue < 0) continue;
    const unknown = adjacent[cell]!.filter((n) => game.clues[n] === null && !knownMines.has(n));
    const mines = clue - adjacent[cell]!.filter((n) => knownMines.has(n)).length;
    if (mines < 0 || mines > unknown.length) return { ...empty, contradiction: true };
    if (unknown.length) constraints.push({ cells: unknown, mines, sources: [cell] });
  }
  const unknown = game.clues.flatMap((clue, cell) => clue === null && !knownMines.has(cell) ? [cell] : []);
  const left = game.settings.mines - knownMines.size;
  if (left < 0 || left > unknown.length) return { ...empty, contradiction: true };
  const total: Constraint = { cells: unknown, mines: left, sources: [] };
  function forced(c: Constraint, reason: Deduction["reason"]): Deduction | null {
    if (c.mines === 0) return { ...empty, safe: c.cells, reason, sources: c.sources };
    if (c.mines === c.cells.length) return { ...empty, mines: c.cells, reason, sources: c.sources };
    return null;
  }
  for (const c of constraints) { const result = forced(c, "count"); if (result !== null) return result; }
  if (unknown.length) { const result = forced(total, "total"); if (result !== null) return result; }
  // Compare a smaller clue with a larger one, including the mine counter.
  // Their difference is another exact count. Never subtract mere overlaps.
  const sets = [...constraints, total].map((c) => new Set(c.cells));
  const all = [...constraints, total];
  for (let i = 0; i < all.length; i += 1) for (let j = 0; j < all.length; j += 1) {
    if (i === j || all[i]!.cells.length >= all[j]!.cells.length) continue;
    if (!all[i]!.cells.every((cell) => sets[j]!.has(cell))) continue;
    const c: Constraint = {
      cells: all[j]!.cells.filter((cell) => !sets[i]!.has(cell)),
      mines: all[j]!.mines - all[i]!.mines,
      sources: [...new Set([...all[i]!.sources, ...all[j]!.sources])],
    };
    if (c.mines < 0 || c.mines > c.cells.length) return { ...empty, contradiction: true };
    const result = forced(c, j === all.length - 1 ? "total" : "overlap");
    if (result !== null) return result;
  }
  // A whole-board constraint would join otherwise independent components.
  // Local enumeration is conservative; the global counter is used above.
  return enumerate ? enumerateForced(constraints) : empty;
}

/** Keep discovering certain mines until there is a safe cell or nothing more is proved. */
export function hintFor(game: VisibleGame): Deduction {
  const known = new Set<number>();
  let last: Deduction = { safe: [], mines: [], reason: "none", sources: [], contradiction: false };
  while (known.size <= game.settings.mines) {
    const result = deduce(game, known);
    if (result.contradiction || result.safe.length) return result;
    const fresh = result.mines.filter((cell) => !known.has(cell));
    if (!fresh.length) return last;
    last = result;
    for (const cell of fresh) known.add(cell);
  }
  return last;
}

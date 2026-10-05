import type { Solver } from "./solve.ts";

/** What a repair run did: whether it reached a board the solver finishes, how many layouts it tried, and how many safe cells it left covered. */
export type RepairOutcome = { solved: boolean; tries: number; remaining: number };

/** How readily a move that leaves more safe cells covered is kept, to climb out of a dead end. Small: nearly all such moves are refused. */
const WARMTH = 0.3;
/** Tries without getting closer after which the search begins again from a new layout, at least. */
const PATIENCE = 1500;
/** How far from the stuck cell a mine may be moved from and to. */
const REACH = 2;

function pick<T>(items: readonly T[], random: () => number): T | undefined {
  return items.length === 0 ? undefined : items[Math.floor(random() * items.length)];
}

/** Move a mine from `from` to `to`, keeping every clue in step. Calling it again with the arguments swapped undoes it. */
function move(solver: Solver, mines: Uint8Array, clues: Int8Array, from: number, to: number): void {
  mines[from] = 0; mines[to] = 1;
  for (const cell of [from, to]) {
    const delta = cell === to ? 1 : -1;
    for (const n of solver.adjacent[cell]!) if (!mines[n]) clues[n]! += delta;
  }
  clues[to] = -1;
  let count = 0;
  for (const n of solver.adjacent[from]!) if (mines[n]) count += 1;
  clues[from] = count;
}

/**
 * Make an unsolvable layout solvable by moving single mines next to the place the solver got stuck, never touching a
 * pinned cell, and keeping a move when it leaves the solver no worse off (and now and then when it does, so that a
 * dead end can be left). The search is counted in layouts tried, never in time, so a seed always gives the same board.
 * `mines` and `clues` are changed in place and hold the answer when the outcome is solved.
 */
export function repair(solver: Solver, mines: Uint8Array, clues: Int8Array, first: number, pinned: ReadonlySet<number>, random: () => number, budget: number, enumerate: boolean, restart: () => void): RepairOutcome {
  const around = (cell: number, radius: number): number[] => {
    const seen = new Set([cell]);
    let ring = [cell];
    for (let step = 0; step < radius; step += 1) {
      const next: number[] = [];
      for (const c of ring) for (const n of solver.adjacent[c]!) if (!seen.has(n)) { seen.add(n); next.push(n); }
      ring = next;
    }
    return [...seen].filter((c) => !pinned.has(c));
  };
  let report = solver.run(clues, first, enumerate);
  let tries = 0, closest = report.remaining, idle = 0;
  const patience = Math.max(PATIENCE, 2 * solver.cells);
  while (!report.solved && tries < budget) {
    tries += 1;
    const frontier: number[] = [], covered: number[] = [], cutOff: number[] = [];
    for (let cell = 0; cell < solver.cells; cell += 1) {
      if (solver.state[cell] !== 0) continue;
      covered.push(cell);
      if (solver.adjacent[cell]!.some((n) => solver.state[n] === 1)) frontier.push(cell);
      else if (!mines[cell] && !pinned.has(cell)) cutOff.push(cell);
    }
    let from: number | undefined, to: number | undefined;
    const lost = cutOff.length > 0 && random() < 0.5 ? pick(cutOff, random) : undefined;
    if (lost !== undefined) {
      // A safe cell no opened clue touches is walled in by mines. Either wall one in more, or take a wall mine away.
      const walls = solver.adjacent[lost]!.filter((n) => mines[n] && !pinned.has(n));
      if (walls.length > 0 && random() < 0.5) { from = pick(walls, random); to = pick(around(from!, REACH).filter((c) => !mines[c]), random); }
      else { to = lost; from = pick(around(lost, REACH + 1).filter((c) => mines[c]), random); }
    } else {
      const focus = pick(frontier.length > 0 ? frontier : covered, random);
      if (focus === undefined) break;
      let near = around(focus, REACH);
      from = pick(near.filter((c) => mines[c]), random);
      if (from === undefined) { near = around(focus, REACH + 2); from = pick(near.filter((c) => mines[c]), random); }
      to = pick(near.filter((c) => !mines[c]), random);
    }
    if (from === undefined || to === undefined) continue;
    move(solver, mines, clues, from, to);
    const next = solver.run(clues, first, enumerate);
    const worse = next.remaining - report.remaining;
    if (worse < 0 || (worse === 0 && next.unresolved <= report.unresolved) || (worse > 0 && random() < Math.exp(-worse / WARMTH))) report = next;
    else move(solver, mines, clues, to, from);
    if (report.remaining < closest) { closest = report.remaining; idle = 0; }
    else if (++idle > patience) {
      // Stuck for a long while in one corner of the search: begin again from a new layout.
      restart();
      report = solver.run(clues, first, enumerate); closest = report.remaining; idle = 0;
    }
  }
  return { solved: report.solved, tries, remaining: report.remaining };
}

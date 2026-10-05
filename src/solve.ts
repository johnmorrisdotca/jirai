import { enumerateForced } from "./enumerate.ts";
import { neighboursOf } from "./grid.ts";
import { activeCell } from "./shape.ts";
import type { Constraint, Settings } from "./jirai.types.ts";

/** Why a cell was proved: one clue, two overlapping clues, the mine counter, or every arrangement of a small frontier. */
export type ProofKind = "count" | "overlap" | "total" | "enumeration";
/** Cells proved by each kind of reasoning. */
export type ProofTally = Record<ProofKind, number>;
/** What a run of the deduction solver found. */
export type SolveReport = {
  /** Every safe cell was opened using only proved deductions. */
  solved: boolean;
  /** Safe cells still covered when the solver stopped; zero when solved. */
  remaining: number;
  /** Safe cells opened, including the free opening. */
  opened: number;
  /** Covered cells, safe or mine, nothing has been proved about. */
  unresolved: number;
  /** Cells opened by the first reveal and its flood, before any deduction. */
  free: number;
  /** Cells proved (safe or mine) by each kind of reasoning. */
  proved: ProofTally;
  /** The longest chain of deductions, each resting on the one before. */
  depth: number;
};

const COVERED = 0, OPEN = 1, MINE = 2, OUTSIDE = 3;

/**
 * The same deductions as `deduce` (one clue, two overlapping clues, the mine counter, exact enumeration of a
 * small frontier), run to a fixed point over one board in a single pass instead of one deduction per scan of the
 * whole field. A deduction found here is a deduction `deduce` would find; the order differs, the closure does not.
 * Built once for a set of settings, then `run` as often as needed on different mine layouts.
 */
export class Solver {
  readonly adjacent: readonly (readonly number[])[];
  readonly cells: number;
  readonly safeTotal: number;
  readonly mineTotal: number;
  readonly state: Uint8Array;
  private readonly start: Uint8Array;
  private readonly need: Int8Array;
  private readonly unknown: Int8Array;
  private readonly chain: Int16Array;
  private readonly dirty: Uint8Array;
  private readonly searched: Uint8Array;
  private readonly marks: Int32Array;
  private readonly seen: Int32Array;
  private readonly visit: Int32Array;
  private readonly queue: number[] = [];
  private readonly stack: number[] = [];
  private clues: Int8Array = new Int8Array(0);
  private stamp = 0;
  private covered = 0;
  private left = 0;
  private opened = 0;
  private free = 0;
  private deepestMine = 0;
  private depth = 0;
  private broken = false;
  private searching = true;
  private proved: ProofTally = { count: 0, overlap: 0, total: 0, enumeration: 0 };

  constructor(readonly settings: Settings, adjacent: readonly (readonly number[])[] = neighboursOf(settings)) {
    this.adjacent = adjacent;
    this.cells = settings.width * settings.height;
    this.start = Uint8Array.from({ length: this.cells }, (_, cell) => activeCell(settings, cell) ? COVERED : OUTSIDE);
    this.safeTotal = this.start.reduce((sum, state) => sum + (state === COVERED ? 1 : 0), 0) - settings.mines;
    this.mineTotal = settings.mines;
    this.state = new Uint8Array(this.cells);
    this.need = new Int8Array(this.cells);
    this.unknown = new Int8Array(this.cells);
    this.chain = new Int16Array(this.cells);
    this.dirty = new Uint8Array(this.cells);
    this.searched = new Uint8Array(this.cells);
    this.marks = new Int32Array(this.cells);
    this.seen = new Int32Array(this.cells);
    this.visit = new Int32Array(this.cells);
  }

  /** Clues of a layout: -1 for a mine, -2 outside the shape, otherwise the count of neighbouring mines. */
  clueFor(mines: ArrayLike<number | boolean>, into: Int8Array = new Int8Array(this.cells)): Int8Array {
    for (let cell = 0; cell < this.cells; cell += 1) {
      if (this.start[cell] === OUTSIDE) { into[cell] = -2; continue; }
      if (mines[cell]) { into[cell] = -1; continue; }
      let count = 0;
      for (const n of this.adjacent[cell]!) if (mines[n]) count += 1;
      into[cell] = count;
    }
    return into;
  }

  /** Play the opening at `first` and every deduction after it. `clues` is read, never changed. */
  run(clues: Int8Array, first: number, enumerate = true): SolveReport {
    this.clues = clues;
    this.state.set(this.start); this.need.fill(0); this.unknown.fill(0); this.chain.fill(0);
    this.dirty.fill(0); this.searched.fill(0); this.queue.length = 0;
    this.covered = this.safeTotal + this.mineTotal; this.left = this.mineTotal;
    this.opened = 0; this.free = 0; this.deepestMine = 0; this.depth = 0; this.broken = false;
    this.proved = { count: 0, overlap: 0, total: 0, enumeration: 0 };
    if ((clues[first] ?? -1) < 0) return this.report();
    this.reveal(first, 0, null);
    this.free = this.opened;
    for (;;) {
      while (this.queue.length > 0 && !this.broken) {
        const cell = this.queue.pop()!;
        this.dirty[cell] = 0;
        while (this.step(cell)) { /* a clue may settle more than once */ }
      }
      if (this.broken || this.opened === this.safeTotal || this.covered === 0) break;
      if (this.counter()) continue;
      if (enumerate && this.enumerate()) continue;
      break;
    }
    return this.report();
  }

  private report(): SolveReport {
    const solved = !this.broken && this.opened === this.safeTotal;
    return { solved, remaining: this.safeTotal - this.opened, unresolved: this.covered, opened: this.opened, free: this.free, proved: { ...this.proved }, depth: this.depth };
  }

  private touch(cell: number): void {
    this.searched[cell] = 0;
    if (!this.dirty[cell]) { this.dirty[cell] = 1; this.queue.push(cell); }
  }

  /** Open a cell known to be safe, and flood through every zero. `kind` null is the free opening. */
  private reveal(start: number, depth: number, kind: ProofKind | null): void {
    const stack = this.stack;
    stack.length = 0; stack.push(start);
    let first = true;
    while (stack.length > 0) {
      const cell = stack.pop()!;
      if (this.state[cell] !== COVERED) continue;
      if (this.clues[cell]! < 0) { this.broken = true; return; }
      if (first && kind !== null) { this.proved[kind] += 1; if (depth > this.depth) this.depth = depth; }
      first = false;
      this.state[cell] = OPEN; this.covered -= 1; this.opened += 1;
      let mines = 0, unknown = 0;
      for (const n of this.adjacent[cell]!) {
        const s = this.state[n];
        if (s === MINE) mines += 1; else if (s === COVERED) unknown += 1;
        else if (s === OPEN) { this.unknown[n]! -= 1; if (depth > this.chain[n]!) this.chain[n] = depth; this.touch(n); }
      }
      this.need[cell] = this.clues[cell]! - mines; this.unknown[cell] = unknown; this.chain[cell] = depth;
      if (this.clues[cell] === 0) { for (const n of this.adjacent[cell]!) if (this.state[n] === COVERED) stack.push(n); }
      else if (unknown > 0) this.touch(cell);
    }
  }

  private flag(cell: number, depth: number, kind: ProofKind): void {
    if (this.state[cell] !== COVERED) return;
    if (this.clues[cell]! >= 0) { this.broken = true; return; }
    this.state[cell] = MINE; this.covered -= 1; this.left -= 1;
    this.proved[kind] += 1; if (depth > this.depth) this.depth = depth;
    if (depth > this.deepestMine) this.deepestMine = depth;
    for (const n of this.adjacent[cell]!) if (this.state[n] === OPEN) {
      this.unknown[n]! -= 1; this.need[n]! -= 1; if (depth > this.chain[n]!) this.chain[n] = depth; this.touch(n);
    }
  }

  private settle(cells: readonly number[], safe: boolean, depth: number, kind: ProofKind): void {
    for (const cell of cells) { if (safe) this.reveal(cell, depth, kind); else this.flag(cell, depth, kind); }
  }

  /** One deduction from the clue at `cell` alone, or from it and an overlapping clue. */
  private step(cell: number): boolean {
    if (this.broken || this.state[cell] !== OPEN || this.unknown[cell] === 0) return false;
    const around = this.adjacent[cell]!;
    const unknown = this.unknown[cell]!, need = this.need[cell]!;
    if (need < 0 || need > unknown) { this.broken = true; return false; }
    const depth = this.chain[cell]! + 1;
    if (need === 0 || need === unknown) {
      this.settle(around.filter((n) => this.state[n] === COVERED), need === 0, depth, "count");
      return true;
    }
    const mine = ++this.stamp;
    for (const n of around) if (this.state[n] === COVERED) this.marks[n] = mine;
    const compared = ++this.stamp;
    for (const x of around) {
      if (this.state[x] !== COVERED) continue;
      for (const other of this.adjacent[x]!) {
        if (other === cell || this.state[other] !== OPEN || this.unknown[other] === 0 || this.seen[other] === compared) continue;
        this.seen[other] = compared;
        let common = 0;
        for (const y of this.adjacent[other]!) if (this.state[y] === COVERED && this.marks[y] === mine) common += 1;
        const there = this.unknown[other]!;
        let rest: number[], mines: number;
        if (common === there && there < unknown) {
          rest = around.filter((n) => this.state[n] === COVERED && !this.adjacent[other]!.includes(n)); mines = need - this.need[other]!;
        } else if (common === unknown && unknown < there) {
          rest = this.adjacent[other]!.filter((n) => this.state[n] === COVERED && this.marks[n] !== mine); mines = this.need[other]! - need;
        } else continue;
        if (mines < 0 || mines > rest.length) { this.broken = true; return false; }
        if (mines !== 0 && mines !== rest.length) continue;
        this.settle(rest, mines === 0, 1 + Math.max(depth - 1, this.chain[other]!), "overlap");
        return true;
      }
    }
    return false;
  }

  /** The mine counter: nothing left to find, everything left a mine, or a clue that accounts for all that remain. */
  private counter(): boolean {
    const covered: number[] = [];
    for (let cell = 0; cell < this.cells; cell += 1) if (this.state[cell] === COVERED) covered.push(cell);
    if (covered.length === 0) return false;
    const depth = this.deepestMine + 1;
    if (this.left === 0 || this.left === covered.length) { this.settle(covered, this.left === 0, depth, "total"); return true; }
    for (let cell = 0; cell < this.cells; cell += 1) {
      if (this.state[cell] !== OPEN || this.unknown[cell] === 0) continue;
      const outside = covered.length - this.unknown[cell]!, mines = this.left - this.need[cell]!;
      if (outside === 0 || (mines !== 0 && mines !== outside)) continue;
      const mark = ++this.stamp;
      for (const n of this.adjacent[cell]!) if (this.state[n] === COVERED) this.marks[n] = mark;
      this.settle(covered.filter((n) => this.marks[n] !== mark), mines === 0, 1 + Math.max(depth - 1, this.chain[cell]!), "total");
      return true;
    }
    return false;
  }

  /**
   * Exact enumeration of every frontier small enough, as `enumerateForced` does. Every component is read from the
   * same position and the answers are applied together, exactly as one `deduce` call does, so that this solver and
   * the hint engine finish the same boards: with a cap on the size of a frontier, the order of enumerating matters.
   */
  private enumerate(): boolean {
    const round = ++this.stamp;
    const found: { mines: number[]; safe: number[]; depth: number }[] = [];
    for (let start = 0; start < this.cells; start += 1) {
      if (this.state[start] !== OPEN || this.unknown[start] === 0 || this.visit[start] === round) continue;
      const clues = [start]; this.visit[start] = round;
      const cells = new Set<number>();
      for (let at = 0; at < clues.length; at += 1) for (const x of this.adjacent[clues[at]!]!) {
        if (this.state[x] !== COVERED || cells.has(x)) continue;
        cells.add(x);
        for (const other of this.adjacent[x]!) if (this.state[other] === OPEN && this.visit[other] !== round) { this.visit[other] = round; clues.push(other); }
      }
      if (cells.size > 18 || clues.every((c) => this.searched[c])) continue;
      clues.sort((a, b) => a - b);
      const constraints: Constraint[] = clues.map((c) => ({ cells: this.adjacent[c]!.filter((n) => this.state[n] === COVERED), mines: this.need[c]!, sources: [c] }));
      const result = enumerateForced(constraints);
      if (result.contradiction) { this.broken = true; return false; }
      if (result.safe.length === 0 && result.mines.length === 0) { for (const c of clues) this.searched[c] = 1; continue; }
      found.push({ mines: [...result.mines], safe: [...result.safe], depth: 1 + clues.reduce((most, c) => Math.max(most, this.chain[c]!), 0) });
    }
    for (const one of found) this.settle(one.mines, false, one.depth, "enumeration");
    for (const one of found) this.settle(one.safe, true, one.depth, "enumeration");
    return found.length > 0;
  }
}

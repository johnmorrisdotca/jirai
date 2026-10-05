import { ENUMERATION_CELLS, ENUMERATION_NODES } from "./jirai.constants.ts";
import type { Constraint, Deduction } from "./jirai.types.ts";

/**
 * Exact assignments within a small connected frontier. If the work budget is
 * reached, none of the partial search is evidence: it returns no deductions.
 */
export function enumerateForced(constraints: readonly Constraint[]): Deduction {
  const empty: Deduction = { safe: [], mines: [], reason: "none", sources: [], contradiction: false };
  const remaining = new Set(constraints.flatMap((c) => [...c.cells]));
  const safe: number[] = [], mines: number[] = [], sources = new Set<number>();
  while (remaining.size > 0) {
    const component = new Set<number>([remaining.values().next().value!]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const c of constraints) {
        if (!c.cells.some((cell) => component.has(cell))) continue;
        for (const cell of c.cells) if (!component.has(cell)) { component.add(cell); grew = true; }
      }
    }
    for (const cell of component) remaining.delete(cell);
    if (component.size > ENUMERATION_CELLS) continue;
    const cells = [...component];
    const relevant = constraints.filter((c) => c.cells.some((cell) => component.has(cell)));
    const positions = relevant.map((c) => c.cells.map((cell) => cells.indexOf(cell)));
    const assigned = new Int8Array(cells.length).fill(-1);
    const seenMine = new Uint8Array(cells.length), seenSafe = new Uint8Array(cells.length);
    let nodes = 0, solutions = 0, stopped = false;
    function visit(at: number): void {
      nodes += 1;
      if (nodes > ENUMERATION_NODES) { stopped = true; return; }
      for (let i = 0; i < relevant.length; i += 1) {
        let filled = 0, unknown = 0;
        for (const p of positions[i]!) {
          if (assigned[p] === -1) unknown += 1;
          else filled += assigned[p]!;
        }
        if (filled > relevant[i]!.mines || filled + unknown < relevant[i]!.mines) return;
      }
      if (at === cells.length) {
        solutions += 1;
        for (let i = 0; i < cells.length; i += 1) (assigned[i] === 1 ? seenMine : seenSafe)[i] = 1;
        return;
      }
      assigned[at] = 0; visit(at + 1);
      if (!stopped) { assigned[at] = 1; visit(at + 1); }
      assigned[at] = -1;
    }
    visit(0);
    if (stopped) continue;
    if (solutions === 0) return { ...empty, contradiction: true };
    for (let i = 0; i < cells.length; i += 1) {
      if (!seenMine[i]) safe.push(cells[i]!);
      if (!seenSafe[i]) mines.push(cells[i]!);
    }
    if (safe.length || mines.length) for (const c of relevant) for (const source of c.sources) sources.add(source);
  }
  return { ...empty, safe, mines, sources: [...sources], reason: safe.length || mines.length ? "enumeration" : "none" };
}

/** Reveal connected empty ground and its numbered boundary, without recursion. */
export function flood(clues: readonly number[], adjacent: readonly (readonly number[])[], open: boolean[], starts: readonly number[], blocked: ReadonlySet<number> = new Set()): void {
  const queue = [...starts];
  const queued = new Set(queue);
  for (let at = 0; at < queue.length; at += 1) {
    const cell = queue[at]!;
    if (open[cell] || blocked.has(cell) || clues[cell] === undefined || clues[cell]! < 0) continue;
    open[cell] = true;
    if (clues[cell] !== 0) continue;
    for (const n of adjacent[cell]!) if (!open[n] && !queued.has(n)) { queue.push(n); queued.add(n); }
  }
}

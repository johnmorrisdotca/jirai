import { Solver } from "./solve.ts";
import type { ProofTally } from "./solve.ts";
import type { Board } from "./jirai.types.ts";

/** How demanding a dealt board is to solve by deduction, measured by solving it. */
export type Measure = {
  /** Mines per playable cell. */
  density: number;
  /** Playable cells. */
  cells: number;
  /** Share of the safe cells the first reveal opens before any reasoning. */
  opening: number;
  /** Cells proved by each kind of reasoning: one clue, two clues together, the mine counter, or every arrangement of a small frontier. */
  proofs: ProofTally;
  /** Share of the playable cells proved by anything beyond one clue's count: the part of the board that needs multi-step reasoning. */
  multiStep: number;
  /** The longest chain of deductions, each resting on the one before. */
  depth: number;
  /** One number for ranking boards: higher is harder. Not a calibrated rating, but monotone in each part above. */
  score: number;
  /** The board can be finished by deduction alone. */
  solvable: boolean;
};

/**
 * Solve a dealt board from its opening and report what it took. The score is
 * `100 × density + 100 × multiStep + depth ÷ 4`, so it rises with the crowding of the mines, with the share of the
 * field that needs more than a single clue, and with how long the longest chain of reasoning runs. It is a way to
 * put boards in order, not a rating of how long a person will take.
 */
export function measureBoard(board: Board): Measure {
  const solver = new Solver(board.settings);
  const report = solver.run(Int8Array.from(board.clues), board.first, true);
  const cells = solver.safeTotal + solver.mineTotal;
  const density = solver.mineTotal / cells;
  const { count, overlap, total, enumeration } = report.proved;
  const multiStep = (overlap + total + enumeration) / cells;
  const opening = solver.safeTotal === 0 ? 0 : report.free / solver.safeTotal;
  const score = 100 * density + 100 * multiStep + report.depth / 4;
  return {
    density, cells, opening, proofs: { count, overlap, total, enumeration }, multiStep, depth: report.depth,
    score: Math.round(score * 10) / 10, solvable: report.solved,
  };
}

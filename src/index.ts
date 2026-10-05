/** Jirai 地雷: the rules and deductions, plain functions over plain data. No DOM and no dependencies. */
export * from "./jirai.types.ts";
export * from "./jirai.constants.ts";
export * from "./grid.ts";
export * from "./generate.ts";
export * from "./game.ts";
export * from "./deduce.ts";
export * from "./keep.ts";
export { seededRandom } from "./random.ts";
/** Package version, kept in step with the release metadata. */
export const VERSION = "0.4.0";

export { SHAPES, activeCell, activeCells } from "./shape.ts";

export * from "./orthogonal.ts";
export { measureBoard } from "./measure.ts";
export type { Measure } from "./measure.ts";
export type { ProofKind, ProofTally } from "./solve.ts";
export { hugeSettings, levelNamed, levelSettings } from "./levels.ts";
export type { HugeSize, LevelSize } from "./levels.ts";

/** Jirai 地雷: the rules and deductions, plain functions over plain data. No DOM and no dependencies. */

export * from "./deduce.ts";
export * from "./game.ts";
export * from "./generate.ts";
export * from "./grid.ts";
export * from "./jirai.constants.ts";
export * from "./jirai.types.ts";
export * from "./keep.ts";
export { seededRandom } from "./random.ts";
/** Package version, kept in step with the release metadata.
 *
 * @example
 * ```ts
 * import { VERSION } from "@johnmorrisdotca/jirai";
 *
 * console.log(VERSION);
 * ```
 */
export const VERSION = "0.5.1";

export type { HugeSize, LevelSize } from "./levels.ts";
export { hugeSettings, levelNamed, levelSettings } from "./levels.ts";
export type { Measure } from "./measure.ts";
export { measureBoard } from "./measure.ts";
export * from "./orthogonal.ts";
export { activeCell, activeCells, SHAPES } from "./shape.ts";
export type { ProofKind, ProofTally } from "./solve.ts";

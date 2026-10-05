/** Jirai 地雷: the rules and deductions, plain functions over plain data. No DOM and no dependencies. */
export * from "./jirai.types.ts";
export * from "./jirai.constants.ts";
export * from "./grid.ts";
export * from "./generate.ts";
export * from "./game.ts";
export * from "./deduce.ts";
export * from "./keep.ts";
export { seededRandom } from "./random.ts";
export const VERSION = "0.1.0";

export { SHAPES, activeCell, activeCells } from "./shape.ts";

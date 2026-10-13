import { HUGE_SIZES, LEVEL_ALIASES, LEVEL_SIZES, LEVELS } from "./jirai.constants.ts";
import { activeCells } from "./shape.ts";
import type { Grid, Level, LevelAlias, Settings } from "./jirai.types.ts";

/** Board size and mine count a level asks for.
 *
 * @example
 * ```ts
 * import type { LevelSize } from "@johnmorrisdotca/jirai";
 * import { levelSettings } from "@johnmorrisdotca/jirai";
 *
 * const value: LevelSize = levelSettings("easy");
 * console.log(value);
 * ```
 */
export type LevelSize = Pick<Settings, "width" | "height" | "mines">;

/**
 * The level a name means, or null. Accepts `easy`, `medium`, `hard` and `extra-hard` (also written `extra hard`,
 * `extra_hard` or `extraHard`, in any case), and the older `beginner`, `intermediate` and `expert`.
 *
 * @param name - A candidate native level name or legacy alias.
 * @returns The canonical native level, or null for an unknown name.
 * @example
 * ```ts
 * import { levelNamed } from "@johnmorrisdotca/jirai";
 *
 * console.log(levelNamed("beginner"));
 * ```
 */
export function levelNamed(name: unknown): Level | null {
  if (typeof name !== "string") return null;
  const key = name.trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/^extrahard$/, "extra-hard");
  if (Object.hasOwn(LEVEL_ALIASES, key)) return LEVEL_ALIASES[key as LevelAlias];
  return (LEVELS as readonly string[]).includes(key) ? key as Level : null;
}

/**
 * The size and mine count of a level. A rectangle gets the level's own numbers; a shaped board keeps the level's
 * width and height and its density of mines over the cells that are left. Throws `RangeError` for a name that is no level.
 *
 * @param level - A native easy, medium, hard or extra-hard level, or a supported older level alias.
 * @param board - The dealt native field; it includes private answer data.
 * @returns The size and mine count of a level. A rectangle gets the level's own numbers; a shaped board keeps the level's width and height and its density of mines over the cells that are left. Throws `RangeError` for a name that is no level.
 * @example
 * ```ts
 * import { levelSettings } from "@johnmorrisdotca/jirai";
 *
 * console.log(levelSettings("easy",{grid:"orthogonal"}));
 * ```
 */
export function levelSettings(level: Level | LevelAlias, board: { grid?: Grid; shape?: Settings["shape"] } = {}): LevelSize {
  const named = levelNamed(level);
  if (named === null) throw new RangeError(`Unknown level: ${String(level)}`);
  const size = LEVEL_SIZES[named];
  if ((board.shape ?? "rectangle") === "rectangle") return { ...size };
  const probe = { ...size, grid: board.grid ?? "square", shape: board.shape, noGuess: true, opening: "clear", seed: 1 } as const;
  const cells = activeCells(probe).length;
  return { width: size.width, height: size.height, mines: Math.max(1, Math.min(cells - 10, Math.round(size.mines / (size.width * size.height) * cells))) };
}

/** The outline of a huge field: one of `HUGE_SIZES`' width and height.
 *
 * @example
 * ```ts
 * import type { HugeSize } from "@johnmorrisdotca/jirai";
 *
 * const value: HugeSize = {width:32,height:32};
 * console.log(value);
 * ```
 */
export type HugeSize = { width: number; height: number };

/**
 * The size and mine count of a level on a huge field: a field of `HUGE_SIZES` (32 × 32 unless `size` says another of them),
 * with the level's own share of mines over its squares. Easy is 12% mines, medium 16%, hard 21% and extra-hard 25%, as
 * on the level's own field, and a heart, star or hexagon outline keeps that share over the squares it has left. Every
 * field is still dealt and proved to need no guess, on every grid. Throws `RangeError` for a name that is no level or a size that is not huge.
 *
 * @param level - A native easy, medium, hard or extra-hard level, or a supported older level alias.
 * @param board - The dealt native field; it includes private answer data.
 * @returns The size and mine count of a level on a huge field: a field of `HUGE_SIZES` (32 × 32 unless `size` says another of them), with the level's own share of mines over its squares. Easy is 12% mines, medium 16%, hard 21% and extra-hard 25%, as on the level's own field, and a heart, star or hexagon outline keeps that share over the squares it has left. Every field is still dealt and proved to need no guess, on every grid. Throws `RangeError` for a name that is no level or a size that is not huge.
 * @example
 * ```ts
 * import { hugeSettings } from "@johnmorrisdotca/jirai";
 *
 * console.log(hugeSettings("easy",{size:{width:32,height:32}}));
 * ```
 */
export function hugeSettings(level: Level | LevelAlias, board: { grid?: Grid; shape?: Settings["shape"]; size?: HugeSize } = {}): LevelSize {
  const named = levelNamed(level);
  if (named === null) throw new RangeError(`Unknown level: ${String(level)}`);
  const size = board.size ?? HUGE_SIZES[0];
  if (!HUGE_SIZES.some((huge) => huge.width === size.width && huge.height === size.height)) throw new RangeError(`Not a huge size: ${size.width} × ${size.height}`);
  const own = LEVEL_SIZES[named];
  const probe = { width: size.width, height: size.height, mines: 1, grid: board.grid ?? "square", shape: board.shape, noGuess: true, opening: "clear", seed: 1 } as const;
  const cells = activeCells(probe).length;
  return { width: size.width, height: size.height, mines: Math.max(1, Math.min(cells - 10, Math.round(own.mines / (own.width * own.height) * cells))) };
}

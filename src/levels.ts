import { LEVEL_ALIASES, LEVEL_SIZES, LEVELS } from "./jirai.constants.ts";
import { activeCells } from "./shape.ts";
import type { Grid, Level, LevelAlias, Settings } from "./jirai.types.ts";

/** Board size and mine count a level asks for. */
export type LevelSize = Pick<Settings, "width" | "height" | "mines">;

/**
 * The level a name means, or null. Accepts `easy`, `medium`, `hard` and `extra-hard` (also written `extra hard`,
 * `extra_hard` or `extraHard`, in any case), and the older `beginner`, `intermediate` and `expert`.
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

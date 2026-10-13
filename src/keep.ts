import { newGame, play } from "./game.ts";
import { validSettings } from "./grid.ts";
import type { Game, Move } from "./jirai.types.ts";

/** Keep settings and moves, never an unchecked answer array. Version the deal before changing it.
 *
 * @param game - The native game, or answer-free VisibleGame required by the signature.
 * @returns Keep settings and moves, never an unchecked answer array. Version the deal before changing it.
 * @example
 * ```ts
 * import type { Settings } from "@johnmorrisdotca/jirai";
 * import { gameProgress, newGame, play } from "@johnmorrisdotca/jirai";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const game=play(newGame(settings),{kind:"reveal",cell:0});
 * console.log(gameProgress(game));
 * ```
 */
export function gameProgress(game: Game): string {
  if (game.settings.grid === "orthogonal") {
    return JSON.stringify({ version: 2, variant: "orthogonal", settings: game.settings, moves: game.moves, helped: game.helped });
  }
  return JSON.stringify({ version: 1, settings: game.settings, moves: game.moves, helped: game.helped });
}

/** A saved game is rebuilt under the rules. Malformed or unavailable boards return null.
 *
 * @param progress - The versioned native move record to validate and replay.
 * @returns The validated replayed native game, or null for invalid, unsupported or unavailable saved data.
 * @example
 * ```ts
 * import type { Settings } from "@johnmorrisdotca/jirai";
 * import { gameFromProgress, gameProgress, newGame, play } from "@johnmorrisdotca/jirai";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const game=play(newGame(settings),{kind:"reveal",cell:0});
 * console.log(gameFromProgress(gameProgress(game))?.status);
 * ```
 */
export function gameFromProgress(progress: string): Game | null {
  if (progress.length > 1_000_000) return null;
  try {
    const data = JSON.parse(progress);
    const orthogonalCode = data.version === 2 && data.variant === "orthogonal";
    if ((!orthogonalCode && data.version !== 1) || !validSettings(data.settings)
      || orthogonalCode !== (data.settings.grid === "orthogonal")
      || !Array.isArray(data.moves) || data.moves.length > 20_000) return null;
    if (data.helped !== undefined && typeof data.helped !== "boolean") return null;
    let game = newGame(data.settings);
    for (const move of data.moves) {
      if (move === null || typeof move !== "object" || !["reveal", "mark", "chord"].includes(move.kind) || !Number.isInteger(move.cell)) return null;
      const next = play(game, move as Move);
      if (next === game) return null;
      game = next;
    }
    return { ...game, helped: data.helped ?? false };
  } catch { return null; }
}

/** UTC by definition, so two people sharing a daily seed get the same board.
 *
 * @param day - A real UTC date written YYYY-MM-DD.
 * @param grid - The native topology/variant used to select the daily-seed format.
 * @returns UTC by definition, so two people sharing a daily seed get the same board.
 * @example
 * ```ts
 * import { dailySeed } from "@johnmorrisdotca/jirai";
 *
 * console.log(dailySeed("2024-01-01","orthogonal"));
 * ```
 */
export function dailySeed(day: string, grid = "square"): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) !== day) throw new RangeError("Use a real day as YYYY-MM-DD.");
  let hash = 2166136261;
  const version = grid === "orthogonal" ? 2 : 1;
  for (const letter of `jirai:${version}:${day}:${grid}`) hash = Math.imul(hash ^ letter.charCodeAt(0), 16777619) >>> 0;
  return hash;
}

import { newGame, play } from "./game.ts";
import { validSettings } from "./grid.ts";
import type { Game, Move } from "./jirai.types.ts";

/** Keep settings and moves, never an unchecked answer array. Version the deal before changing it. */
export function gameProgress(game: Game): string {
  if (game.settings.grid === "orthogonal") {
    return JSON.stringify({ version: 2, variant: "orthogonal", settings: game.settings, moves: game.moves, helped: game.helped });
  }
  return JSON.stringify({ version: 1, settings: game.settings, moves: game.moves, helped: game.helped });
}

/** A saved game is rebuilt under the rules. Malformed or unavailable boards return null. */
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

/** UTC by definition, so two people sharing a daily seed get the same board. */
export function dailySeed(day: string, grid = "square"): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) !== day) throw new RangeError("Use a real day as YYYY-MM-DD.");
  let hash = 2166136261;
  const version = grid === "orthogonal" ? 2 : 1;
  for (const letter of `jirai:${version}:${day}:${grid}`) hash = Math.imul(hash ^ letter.charCodeAt(0), 16777619) >>> 0;
  return hash;
}

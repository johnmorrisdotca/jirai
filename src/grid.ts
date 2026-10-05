import { GRID_SPECS, MAX_CELLS, MAX_SIDE } from "./jirai.constants.ts";
import { activeCell, activeCells, SHAPES } from "./shape.ts";
import type { Settings } from "./jirai.types.ts";

/** Reject a setting before it reaches a board allocation or a shuffle. */
export function validSettings(value: unknown): value is Settings {
  if (value === null || typeof value !== "object") return false;
  const s = value as Settings;
  return Number.isInteger(s.width) && s.width >= 3 && s.width <= MAX_SIDE
    && Number.isInteger(s.height) && s.height >= 3 && s.height <= MAX_SIDE
    && s.width * s.height <= MAX_CELLS
    && Number.isInteger(s.mines) && s.mines >= 1 && s.mines < s.width * s.height
    && (s.shape === undefined || SHAPES.includes(s.shape))
    && ((s.shape ?? "rectangle") === "rectangle" || (s.width >= 9 && s.height >= 9 && s.grid !== "wrap"))
    && s.mines < activeCells(s).length
    && Object.hasOwn(GRID_SPECS, s.grid) && typeof s.noGuess === "boolean"
    && (s.opening === "safe" || s.opening === "clear")
    && Number.isInteger(s.seed) && s.seed >= 0 && s.seed <= 0xffffffff;
}
/** Reports whether a row-major cell is inside the board's active shape. */
export function validCell(settings: Settings, cell: number): boolean {
  return Number.isInteger(cell) && cell >= 0 && cell < settings.width * settings.height && activeCell(settings, cell);
}
/** Every neighbour once. Wrap joins both pairs of opposite edges. */
export function neighbours(settings: Settings, cell: number): number[] {
  if (!validCell(settings, cell)) return [];
  const spec = GRID_SPECS[settings.grid];
  const x = cell % settings.width;
  const y = Math.floor(cell / settings.width);
  const out = new Set<number>();
  for (const [dx, dy] of spec.offsets) {
    let nx = x + dx, ny = y + dy;
    if (spec.wrap) {
      nx = (nx + settings.width) % settings.width;
      ny = (ny + settings.height) % settings.height;
    }
    if (nx >= 0 && nx < settings.width && ny >= 0 && ny < settings.height) { const next = ny * settings.width + nx; if (validCell(settings, next)) out.add(next); }
  }
  return [...out].sort((a, b) => a - b);
}
/** Precomputes the neighbour list for each row-major cell. */
export function neighboursOf(settings: Settings): number[][] {
  return Array.from({ length: settings.width * settings.height }, (_, cell) => neighbours(settings, cell));
}

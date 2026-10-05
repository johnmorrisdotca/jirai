import type { Settings } from "./jirai.types.ts";
/** Board silhouettes supported by settings. */
export const SHAPES = ["rectangle", "heart", "star", "hexagon"] as const;
/** Row-major addresses stay stable; omitted cells have no clue and no neighbours. */
export function activeCell(settings: Settings, cell: number): boolean {
  if (!Number.isInteger(cell) || cell < 0 || cell >= settings.width * settings.height) return false;
  const col = cell % settings.width, row = Math.floor(cell / settings.width);
  const x = 2 * (col + .5) / settings.width - 1, y = 2 * (row + .5) / settings.height - 1;
  switch (settings.shape ?? "rectangle") {
    case "heart": {
      const hx = x * 1.15, hy = -y * 1.25 + .15;
      return (hx * hx + hy * hy - 1) ** 3 - hx * hx * hy ** 3 <= 0;
    }
    case "star": {
      // A filled five-point polygon, never a decorative overlay on hidden square cells.
      const vertices = Array.from({ length: 10 }, (_, i) => {
        const angle = -Math.PI / 2 + i * Math.PI / 5, radius = i % 2 ? .48 : 1;
        return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const;
      });
      let inside = false;
      for (let i = 0, j = 9; i < 10; j = i++) {
        const [xi, yi] = vertices[i]!, [xj, yj] = vertices[j]!;
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    }
    case "hexagon": return settings.grid === "hex" ? Math.abs(x + y) <= 1 : Math.abs(x) <= 1 - .5 * Math.abs(y);
    default: return true;
  }
}
/** Returns all active cells in stable row-major order. */
export function activeCells(settings: Settings): number[] {
  return Array.from({ length: settings.width * settings.height }, (_, cell) => cell).filter(cell => activeCell(settings, cell));
}

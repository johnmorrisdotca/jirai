import type { Game, Language, Material, Pieces, Settings } from "./jirai.types.ts";
/** Appearance and optional hint marker used by drawing and play. */
export type DrawOptions = { material?: Material; pieces?: Pieces; language?: Language; hint?: number | null };
/** Accessible presentation data for one active board cell. */
export type CellModel = { cell: number; x: number; y: number; width: number; height: number; label: string; text: string; kind: string; hint: boolean };
/** Layout and cell presentation returned by `boardModel`. */
export type BoardModel = { width: number; height: number; cells: CellModel[] };
/** Initial game, appearance, control, and lifecycle callbacks for a mounted board. */
export type MountOptions = DrawOptions & {
  settings?: Settings;
  progress?: string;
  controls?: boolean;
  onChange?: (game: Game) => void;
  onFinish?: (game: Game) => void;
  onError?: (error: Error) => void;
};
/** Controls for reading and operating a mounted board. */
export type JiraiMount = {
  game: () => Game;
  progress: () => string;
  play: (cell: number, mark?: boolean) => void;
  hint: () => void;
  restart: () => void;
  load: (settings: Settings, progress?: string) => void;
  set: (options: DrawOptions) => void;
  destroy: () => void;
};

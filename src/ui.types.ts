import type { Game, Language, Material, Pieces, Settings } from "./jirai.types.ts";
export type DrawOptions = { material?: Material; pieces?: Pieces; language?: Language; hint?: number | null };
export type CellModel = { cell: number; x: number; y: number; width: number; height: number; label: string; text: string; kind: string; hint: boolean };
export type BoardModel = { width: number; height: number; cells: CellModel[] };
export type MountOptions = DrawOptions & {
  settings?: Settings;
  progress?: string;
  controls?: boolean;
  onChange?: (game: Game) => void;
  onFinish?: (game: Game) => void;
  onError?: (error: Error) => void;
};
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

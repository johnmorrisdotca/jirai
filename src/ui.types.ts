import type { Game, Language, Material, Pieces, Settings } from "./jirai.types.ts";
/** Appearance and optional hint marker used by drawing and play.
 *
 * @example
 * ```ts
 * import type { DrawOptions } from "@johnmorrisdotca/jirai/draw";
 *
 * const value: DrawOptions = {material:"ivory",pieces:"flowers",language:"ja",hint:null};
 * console.log(value);
 * ```
 */
export type DrawOptions = { material?: Material; pieces?: Pieces; language?: Language; hint?: number | null };
/** Accessible presentation data for one active board cell.
 *
 * @example
 * ```ts
 * import type { Settings } from "@johnmorrisdotca/jirai";
 * import { newGame, play } from "@johnmorrisdotca/jirai";
 * import type { CellModel } from "@johnmorrisdotca/jirai/draw";
 * import { boardModel } from "@johnmorrisdotca/jirai/draw";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const game=play(newGame(settings),{kind:"reveal",cell:0});
 * const value: CellModel = boardModel(game).cells[0]!;
 * console.log(value);
 * ```
 */
export type CellModel = { cell: number; x: number; y: number; width: number; height: number; label: string; text: string; kind: string; hint: boolean };
/** Layout and cell presentation returned by `boardModel`.
 *
 * @example
 * ```ts
 * import type { Settings } from "@johnmorrisdotca/jirai";
 * import { newGame, play } from "@johnmorrisdotca/jirai";
 * import type { BoardModel } from "@johnmorrisdotca/jirai/draw";
 * import { boardModel } from "@johnmorrisdotca/jirai/draw";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const game=play(newGame(settings),{kind:"reveal",cell:0});
 * const value: BoardModel = boardModel(game);
 * console.log(value);
 * ```
 */
export type BoardModel = { width: number; height: number; cells: CellModel[] };
/** Initial game, appearance, control, and lifecycle callbacks for a mounted board.
 *
 * @example
 * ```ts
 * import type { Settings } from "@johnmorrisdotca/jirai";
 * import type { MountOptions } from "@johnmorrisdotca/jirai/play";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const value: MountOptions = {settings,language:"ja",material:"wood",pieces:"flags"};
 * console.log(value);
 * ```
 */
export type MountOptions = DrawOptions & {
  settings?: Settings;
  progress?: string;
  controls?: boolean;
  onChange?: (game: Game) => void;
  onFinish?: (game: Game) => void;
  onError?: (error: Error) => void;
};
/** Controls for reading and operating a mounted board.
 *
 * @example
 * ```ts no-run
 * import type { Settings } from "@johnmorrisdotca/jirai";
 * import { newGame, play } from "@johnmorrisdotca/jirai";
 * import type { JiraiMount } from "@johnmorrisdotca/jirai/play";
 * import { mountJirai } from "@johnmorrisdotca/jirai/play";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const game=play(newGame(settings),{kind:"reveal",cell:0});
 * const host=document.createElement("div");
 * document.body.append(host);
 * const mounted: JiraiMount=mountJirai(host,{settings});
 * console.log(mounted.game().status);
 * mounted.destroy();
 * ```
 */
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

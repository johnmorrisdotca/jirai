import { activeCell, activeCells } from "./shape.ts";
import { flood } from "./flood.ts";
import { makeBoard } from "./generate.ts";
import { DEFAULT_SETTINGS, MARKS, MOVES, STATUSES } from "./jirai.constants.ts";
import { neighbours, neighboursOf, validCell, validSettings } from "./grid.ts";
import type { Board, Game, Move, Settings, VisibleGame } from "./jirai.types.ts";

/** Creates an unstarted game with covered cells and no dealt answer.
 *
 * @param settings - The validated native field dimensions, mine count, topology, shape, opening, generation policy and numeric seed.
 * @returns Creates an unstarted game with covered cells and no dealt answer.
 * @example
 * ```ts
 * import type { Settings } from "@johnmorrisdotca/jirai";
 * import { newGame } from "@johnmorrisdotca/jirai";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * console.log(newGame(settings).status);
 * ```
 */
export function newGame(settings: Settings = DEFAULT_SETTINGS): Game {
  if (!validSettings(settings)) throw new RangeError("Invalid Minesweeper settings.");
  return { settings: { ...settings }, board: null, marks: Array.from({ length: settings.width * settings.height }, () => MARKS.covered), status: STATUSES.ready, exploded: null, moves: [], helped: false };
}

/** The clue-only view used by the solver. No hidden mine, including under a flag, survives it.
 *
 * @param game - The native game, or answer-free VisibleGame required by the signature.
 * @returns The clue-only view used by the solver. No hidden mine, including under a flag, survives it.
 * @example
 * ```ts
 * import type { Settings } from "@johnmorrisdotca/jirai";
 * import { newGame, play, visibleGame } from "@johnmorrisdotca/jirai";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const game=play(newGame(settings),{kind:"reveal",cell:0});
 * console.log(visibleGame(game).clues);
 * ```
 */
export function visibleGame(game: Game): VisibleGame {
  return { settings: { ...game.settings }, marks: [...game.marks], status: game.status,
    clues: game.marks.map((mark, cell) => !activeCell(game.settings, cell) ? -2 : mark === MARKS.open ? game.board?.clues[cell] ?? null : null) };
}

/** Attaches a worker-dealt board that matches the game's settings, preserving existing moves.
 *
 * @param game - The native game, or answer-free VisibleGame required by the signature.
 * @param board - The dealt native field; it includes private answer data.
 * @returns Attaches a worker-dealt board that matches the game's settings, preserving existing moves.
 * @example
 * ```ts
 * import type { Settings } from "@johnmorrisdotca/jirai";
 * import { makeBoard, newGame, withBoard } from "@johnmorrisdotca/jirai";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * const board=makeBoard(settings,0,{attempts:1,repair:false});
 * console.log(withBoard(newGame(settings),board).board?.first);
 * ```
 */
export function withBoard(game: Game, board: Board): Game {
  if (game.board !== null || (game.settings.shape ?? "rectangle") !== (board.settings.shape ?? "rectangle") || (Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]).some(key => game.settings[key] !== board.settings[key])) throw new Error("The board does not belong to this game.");
  return { ...game, board };
}

/** A legal move returns a new game; an unavailable move returns the same one.
 *
 * @param game - The native game, or answer-free VisibleGame required by the signature.
 * @param move - A native reveal, mark-cycle or chord with its row-major active-cell index.
 * @returns A legal move returns a new game; an unavailable move returns the same one.
 * @example
 * ```ts
 * import type { Settings } from "@johnmorrisdotca/jirai";
 * import { newGame, play } from "@johnmorrisdotca/jirai";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * console.log(play(newGame(settings),{kind:"reveal",cell:0}).status);
 * ```
 */
export function play(game: Game, move: Move): Game {
  if (!validCell(game.settings, move.cell) || game.status === STATUSES.won || game.status === STATUSES.lost) return game;
  const before = game.marks[move.cell]!;
  if (move.kind === MOVES.mark) {
    if (before === MARKS.open) return game;
    const marks = [...game.marks];
    marks[move.cell] = before === MARKS.covered ? MARKS.flag : before === MARKS.flag ? MARKS.question : MARKS.covered;
    return { ...game, marks, moves: [...game.moves, { ...move }] };
  }
  if (move.kind !== MOVES.reveal && move.kind !== MOVES.chord) return game;
  if (before === MARKS.flag || (move.kind === MOVES.chord && before !== MARKS.open)) return game;
  const board = game.board ?? makeBoard(game.settings, move.cell);
  let starts = [move.cell];
  if (before === MARKS.open) {
    const around = neighbours(game.settings, move.cell);
    if (around.filter((cell) => game.marks[cell] === MARKS.flag).length !== board.clues[move.cell]) return game;
    starts = around.filter((cell) => game.marks[cell] !== MARKS.flag && game.marks[cell] !== MARKS.open);
  }
  if (!starts.length) return game;
  const marks = [...game.marks];
  const exploded = starts.find((cell) => board.mines[cell]) ?? null;
  const open = marks.map((mark) => mark === MARKS.open);
  const blocked = new Set(marks.flatMap((mark, cell) => mark === MARKS.flag ? [cell] : []));
  flood(board.clues, neighboursOf(game.settings), open, starts, blocked);
  for (let cell = 0; cell < marks.length; cell += 1) if (open[cell]) marks[cell] = MARKS.open;
  if (exploded !== null) marks[exploded] = MARKS.open;
  const status = exploded !== null ? STATUSES.lost
    : open.filter(Boolean).length === activeCells(game.settings).length - game.settings.mines ? STATUSES.won : STATUSES.playing;
  return { ...game, board, marks, status, exploded, moves: [...game.moves, { ...move }] };
}

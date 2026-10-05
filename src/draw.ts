import { activeCell } from "./shape.ts";
import { GRIDS, MARKS, STATUSES } from "./jirai.constants.ts";
import { words } from "./strings.ts";
import type { Game } from "./jirai.types.ts";
import type { BoardModel, DrawOptions } from "./ui.types.ts";

/** Where the cells sit, and what may be shown. The drawing never exposes a covered clue. */
export function boardModel(game: Game, options: DrawOptions = {}): BoardModel {
  const hex = game.settings.grid === GRIDS.hex;
  const ended = game.status === STATUSES.lost || game.status === STATUSES.won;
  const say = words(options.language);
  const width = hex ? game.settings.width + (game.settings.height - 1) / 2 : game.settings.width;
  const height = hex ? (game.settings.height - 1) * .866 + 1.155 : game.settings.height;
  const cells = game.marks.flatMap((mark, cell) => {
    if (!activeCell(game.settings, cell)) return [];
    const col = cell % game.settings.width, row = Math.floor(cell / game.settings.width);
    const mine = ended && game.board?.mines[cell] === true;
    const wrong = ended && mark === MARKS.flag && !mine;
    const clue = mark === MARKS.open ? game.board?.clues[cell] ?? 0 : 0;
    const kind = cell === game.exploded ? "exploded" : mine ? "mine" : wrong ? "wrong" : mark;
    const text = mine ? "✹" : wrong ? "×" : mark === MARKS.flag ? options.pieces === "stones" ? "●" : options.pieces === "flowers" ? "✿" : "⚑"
      : mark === MARKS.question ? "?" : mark === MARKS.open && clue > 0 ? String(clue) : "";
    const description = mine ? say.mine : wrong ? say.wrong : mark === MARKS.open ? clue === 0 ? say.empty : `${clue}` : say[mark];
    return [{ cell, x: col + (hex ? row / 2 : 0), y: row * (hex ? .866 : 1), width: 1, height: hex ? 1.155 : 1,
      label: `${row + 1}, ${col + 1}: ${description}`, text, kind, hint: options.hint === cell }];
  });
  return { width, height, cells };
}

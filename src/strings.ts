import type { Language } from "./jirai.types.ts";
/** Built-in English and Japanese strings used by the player and renderer. */
export const STRINGS = {
  en: {
    board: "Minesweeper board", covered: "covered", flag: "flagged", question: "uncertain", empty: "empty", mine: "mine", wrong: "incorrect flag",
    ready: "Open a cell to begin. Your first cell is safe.", playing: "Read the numbers. Open every safe cell.", won: "Every safe cell is open. Well played.", lost: "A mine. Try the same board again, or start another.",
    checking: "Finding a board that can be solved without guessing…", restart: "Start over", hint: "Hint", reveal: "Open", mark: "Mark", mines: "Mines left", time: "Time", moves: "Moves", clear: "Cleared", view: "Just the board", close: "Close", hintNone: "No certain move proved. This position may need a guess.", hintSafe: "This cell is safe.", hintMine: "This cell contains a mine.", count: "The neighbouring count settles it.", overlap: "Compare the overlapping clues.", total: "The total mine count settles it.", enumeration: "Every consistent arrangement gives the same answer.",
    help: "Tap to open; right-click or hold to mark. Use the arrows to move, Enter to open, F or Space to mark. Tap an open number to clear its neighbours when the flags match.",
    error: "A verified board was not found. Try another seed, an opening elsewhere, or fewer mines.",
  },
  ja: {
    board: "地雷の盤", covered: "未開封", flag: "旗", question: "不明", empty: "空き", mine: "地雷", wrong: "間違った旗",
    ready: "マスを開けて始めます。最初のマスは安全です。", playing: "数字を手がかりに、安全なマスをすべて開けましょう。", won: "安全なマスがすべて開きました。クリア！", lost: "地雷でした。同じ盤で再挑戦できます。",
    checking: "推測なしで解ける盤を探しています…", restart: "やり直す", hint: "ヒント", reveal: "開く", mark: "印を付ける", mines: "残りの地雷", time: "時間", moves: "手数", clear: "開いたマス", view: "盤だけ", close: "閉じる", hintNone: "確実な手は見つかりませんでした。推測が必要かもしれません。", hintSafe: "このマスは安全です。", hintMine: "このマスには地雷があります。", count: "周囲の数字から確定できます。", overlap: "重なった手がかりを比べましょう。", total: "地雷の総数から確定できます。", enumeration: "可能な配置すべてで同じ答えになります。",
    help: "タップで開く、右クリックか長押しで印を付けます。矢印キーで移動、Enterで開く、FかSpaceで印を付けます。旗の数が合う数字をタップすると周囲が開きます。",
    error: "推測なしで解ける盤が見つかりませんでした。別のシード、別の開始マス、または少ない地雷で試してください。",
  },
} as const;
/** Returns the built-in interface strings for a locale. */
export function words(language: Language = "en"): typeof STRINGS["en"] | typeof STRINGS["ja"] { return STRINGS[language]; }

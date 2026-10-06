<h1 align="center">Jirai <sub>地雷</sub></h1>

<p align="center"><strong>Every number is a clue.</strong><br>
Minesweeper across four-neighbour, eight-neighbour, hexagonal and wraparound grids. Choose a shape, lay a seeded field, and clear it with deductions you can trust.</p>

<p align="center">
  <a href="https://github.com/johnmorrisdotca/jirai/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/johnmorrisdotca/jirai/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@johnmorrisdotca/jirai"><img alt="npm" src="https://img.shields.io/npm/v/@johnmorrisdotca/jirai?color=2f5d4a"></a>
  <a href="./LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-2f5d4a"></a>
  <img alt="No runtime dependencies" src="https://img.shields.io/badge/runtime%20dependencies-0-2f5d4a">
  <img alt="TypeScript" src="https://img.shields.io/badge/types-TypeScript-3178c6">
</p>

<p align="center"><a href="https://johnmorrisdotca.github.io/jirai/"><strong>Play Jirai →</strong></a> · <a href="https://johnmorrisdotca.github.io/jirai/api.html">API reference</a></p>

<table align="center">
<tr>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/hero-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/hero-desk-light.webp" alt="The demo on a desk, in English: the page header with the language chooser, the API reference link, five cloth patches and the Help switch, the Your field choices (board, shape, level, width, height, mines, no-guess, first opening, material, markers and seed), and the Hexagonal field on green felt: a nine by nine board of hexagons on a wooden tray with the opened cells showing blue and green number clues, the counters Mines left 10, Time 0:00 and Moves 1, and the Start over, Open, Hint and Just the board buttons" width="600">
</picture>
<br><em>The demo on a desk: a hexagonal field, opened at its middle.</em>
</td>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/hero-phone-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/hero-phone-light.webp" alt="The demo on a phone, in Japanese: an orthogonal nine by nine field with opened cells and number clues, the status line 数字を手がかりに、安全なマスをすべて開けましょう, the buttons やり直す, 開く, ヒント and 盤だけ, and the start of the rules under it" width="190">
</picture>
<br><em>On a phone, in Japanese, in the device's light or dark.</em>
</td>
</tr>
</table>

Jirai is a Minesweeper rules engine and player for TypeScript and JavaScript. The core is plain functions; drawing, browser controls, a custom element and an optional React wrapper are separate imports. The package has no runtime dependencies and needs Node 22 or a modern browser.

## In 30 seconds

```sh
npm install @johnmorrisdotca/jirai
```

```ts
import { DEFAULT_SETTINGS, hintFor, newGame, play, visibleGame } from "@johnmorrisdotca/jirai";

let game = newGame({ ...DEFAULT_SETTINGS, width: 9, height: 9, mines: 10, seed: 42 });
game = play(game, { kind: "reveal", cell: 40 }); // the first reveal deals the seeded board
const hint = hintFor(visibleGame(game));          // certain safe cells/mines from clues only
```

For a dedicated four-neighbour variant, its entry fixes the topology for you:

```ts
import { makeOrthogonalBoard, newOrthogonalGame } from "@johnmorrisdotca/jirai/orthogonal";

const settings = { width: 9, height: 9, mines: 10, noGuess: true, opening: "clear" as const, seed: 42 };
const game = newOrthogonalGame(settings);
const board = makeOrthogonalBoard(settings, 40); // counts only edge-sharing neighbours
```

## Who it is for

- **Puzzle and game sites** that want Minesweeper with boards a player can trust: seeded fields that deal the same everywhere, a safe opening, verified no-guess deals, and the words in English and Japanese.
- **Developers of other front ends** who want the rules, the dealer and the deduction solver as plain functions, with no DOM, and their own drawing on top.
- **Players and teachers** who want to learn why a cell is safe: the hints explain the deduction that proves it, and a level steps up a measured difficulty.

## Features

- **Four rule sets:** square grids count eight neighbours, orthogonal grids count four, hex grids count six axial neighbours, and wraparound grids join opposite square edges.
- **Board outlines:** rectangles, hearts, stars and hexagon outlines. Shaped boards have cut-outs; wraparound works with rectangles.
- **A fair first move:** choose a safe first cell or a clear opening with all its neighbours safe.
- **Four levels:** easy (9×9, 10 mines), medium (16×16, 40), hard (30×16, 99) and extra-hard (40×24, 240), on every rule and outline. The old names `beginner`, `intermediate` and `expert` still work and mean easy, medium and hard.
- **Verified no-guess deals:** optional deduction-only dealing accepts a board only when the solver proves every safe cell from the opening, even at extra-hard's 25% mines. It throws `GenerationError` when the bounded search cannot prove one.
- **Fixed seeded fields:** after the opening, mines never move. A seed and settings reproduce the same deal.
- **Familiar play:** reveal, flag, question-mark, chord, flood-open, explained hint, timer, undo by saved replay, and a just-the-board dialog.
- **Accessible controls:** keyboard navigation, pointer and touch, long press to mark, English and Japanese strings, and board labels read by assistive technology.
- **Materials and markers:** ivory, wood or slate; flags, stones or flowers. Host CSS can replace the palette.

### What's in it

Each picture is the real player, drawn by the package and taken from [the demo](https://johnmorrisdotca.github.io/jirai/) with `pnpm screenshots:readme`, in light and dark. Every field is the same seed, opened at the same cell, so the pictures are the same each run.

<table>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/square-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/square-desk-light.webp" alt="A nine by nine square field on a wooden tray on a desk, opened at its middle cell, with blue, green and red number clues, the counters Mines left 10, Time 0:00 and Moves 1, and the Start over, Open, Hint and Just the board buttons" width="360">
</picture>
<br><em><strong>Square.</strong> A number counts the eight cells around it.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/orthogonal-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/orthogonal-desk-light.webp" alt="A nine by nine orthogonal field on a desk, opened at its middle cell: the opened patch is larger and the clues are fewer, the title Orthogonal field and the counters Mines left 10" width="360">
</picture>
<br><em><strong>Orthogonal.</strong> A number counts only the four cells that share an edge.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/hex-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/hex-desk-light.webp" alt="A nine by nine hexagonal field on a desk: rows of hexagons offset along a slanting parallelogram, opened at its middle with blue and green clues, titled Hexagonal field" width="360">
</picture>
<br><em><strong>Hexagonal.</strong> A number counts the six cells around a hexagon.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/wraparound-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/wraparound-desk-light.webp" alt="A nine by nine wraparound field on a desk, opened at its middle, with clues along its edges that count cells on the opposite edge, titled Wraparound field" width="360">
</picture>
<br><em><strong>Wraparound.</strong> Opposite edges join, so a clue on an edge counts across it.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/heart-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/heart-desk-light.webp" alt="A heart-shaped sixteen by sixteen field on a desk, made of square cells with the cut-out corners missing, opened in its middle, with many number clues and the counters Mines left 27" width="360">
</picture>
<br><em><strong>A heart.</strong> Outlines cut cells out of the field: a heart, a star or a hexagon, with the level's share of mines.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/star-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/star-desk-light.webp" alt="A star-shaped sixteen by sixteen orthogonal field on a desk, a five-pointed star of square cells with its points cut out of the rectangle, opened in its middle, with the counters Mines left 14" width="360">
</picture>
<br><em><strong>A star.</strong> Shaped boards work on every rule; here the four-neighbour rule.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/hint-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/hint-desk-light.webp" alt="A nine by nine square field on a desk after the Hint button: one cell is outlined in pale green, and the status line says This cell is safe. The neighbouring count settles it." width="360">
</picture>
<br><em><strong>The explained hint.</strong> The cell is outlined and the line says why it is certain.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/slate-flowers-phone-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/jirai/main/docs/images/slate-flowers-phone-light.webp" alt="A nine by nine field on a phone in the slate material with flowers as markers: dark grey cells with white numbers, three flowers marking covered cells, the counters Mines left 8, Time 0:00 and Moves 3, the status line, the buttons Start over, Open, Hint and Just the board, and the line of help under them" width="240">
</picture>
<br><em><strong>On a phone.</strong> Slate with flowers; a tap opens, and a long press or the Open button marks.</em>
</td>
</tr>
</table>

## Use it in your project

### Install

```sh
npm install @johnmorrisdotca/jirai
pnpm add @johnmorrisdotca/jirai
yarn add @johnmorrisdotca/jirai
```

It is ES modules only, with its types included, and needs Node 22 or later outside a browser. A page with no bundler loads the tag from a CDN (`@0` is the major version).

### A player from a script

Mount a player into any element. The first reveal asks the module worker to deal the board, so serve the package over HTTP and allow same-origin module workers in your content security policy.

```ts no-run
import { DEFAULT_SETTINGS } from "@johnmorrisdotca/jirai";
import { mountJirai } from "@johnmorrisdotca/jirai/play";

const board = mountJirai(document.querySelector<HTMLElement>("#game")!, {
  settings: { ...DEFAULT_SETTINGS, grid: "orthogonal", seed: 7 },
  material: "wood",
  pieces: "stones",
  language: "en",
  onChange(game) { localStorage.setItem("jirai", board.progress()); },
  onFinish(game) { console.log(game.status, game.helped); },
  onError(error) { console.error(error); },
});
board.set({ material: "slate", language: "ja" });
board.restart();
board.destroy();
```

The handle also provides `game()`, `progress()`, `play(cell, mark?)`, `hint()`, and `load(settings, progress?)`. Set `controls: false` when your page supplies its own controls and status. Change options with `set`; call `destroy` when the host is removed.

### The tag

Use the custom element without a mount call:

```html
<script type="module">
  import "@johnmorrisdotca/jirai/element/define";
</script>
<jirai-board width="9" height="9" mines="10" seed="42"
  grid="orthogonal" no-guess="true"
  material="wood" pieces="stones" lang="ja"></jirai-board>
```

The tag reads `width`, `height`, `mines`, `seed`, `grid`, `shape`, `no-guess`, `material`, `pieces` and `lang`, and mounts again when one changes; the first opening is the default (`clear`), and `jirai-error` is the event it fires when a field cannot be dealt.

### The React component

The optional React entry exports `JiraiBoard` from `@johnmorrisdotca/jirai/react`; React is an optional peer dependency. Its options are read when mounted. Use a new React `key` to start with a different settings object.

### In a framework

Two ways: the `<jirai-board>` tag, which every framework can carry, and `JiraiBoard`, the React component. The player deals a board in a module worker, so the page must be served over HTTP.

#### React

```jsx
import { JiraiBoard } from "@johnmorrisdotca/jirai/react";

export function Game({ seed }) {
  // The options are read when it mounts: a new key starts it with different settings.
  return <JiraiBoard key={seed} settings={{ grid: "orthogonal", width: 9, height: 9, mines: 10, seed }} material="wood" onFinish={(game) => console.log(game.status)} />;
}
```

#### Vue

Vue needs to be told that `jirai-board` is a custom element, a compiler option.

```vue
<script setup>
import "@johnmorrisdotca/jirai/element/define";
defineProps({ seed: Number });
</script>

<template>
  <jirai-board width="9" height="9" mines="10" :seed="seed" grid="hex" material="slate" pieces="flowers"></jirai-board>
</template>
```

```js no-check
// vite.config.js
import vue from "@vitejs/plugin-vue";

export default { plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag === "jirai-board" } } })] };
```

#### Svelte

```svelte
<script>
  import "@johnmorrisdotca/jirai/element/define";
  export let seed = 42;
</script>

<jirai-board width="16" height="16" mines="40" {seed} grid="square" lang="ja"></jirai-board>
```

#### Angular

```ts no-check
import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import "@johnmorrisdotca/jirai/element/define";

@Component({
  selector: "app-game",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<jirai-board width="9" height="9" mines="10" seed="42" grid="orthogonal"></jirai-board>`,
})
export class GameComponent {}
```

## Examples

Each example is a whole recipe: copy it and it works. The ones in TypeScript are run in CI against the built package (`pnpm test:readme`), so none of them is a guess, and the output shown is what they print.

### A game on a page with no script of your own

Save this as a file, serve it over HTTP (the player deals in a module worker, which a `file:` page cannot load) and open it: a hexagonal field, dealt from a seed that is proved to need no guess.

```html
<!doctype html>
<meta charset="utf-8">
<title>Jirai</title>
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/jirai@0/dist/element-define.js"></script>
<jirai-board width="12" height="12" mines="22" seed="2026" grid="hex" material="wood" pieces="flowers"></jirai-board>
```

### The first move deals the board

`newGame` makes a ready game with no mines in it. The first reveal deals the seeded field, with that cell and, by default, its neighbours safe, so nobody loses on the first move.

```ts
import { DEFAULT_SETTINGS, newGame, play } from "@johnmorrisdotca/jirai";

let game = newGame({ ...DEFAULT_SETTINGS, width: 9, height: 9, mines: 10, seed: 42 });
console.log(game.status, game.board);                           // ready, nothing dealt yet
game = play(game, { kind: "reveal", cell: 40 });
console.log(game.status, "dealt around cell", game.board!.first, "with", game.board!.mines.filter(Boolean).length, "mines");
console.log(play(game, { kind: "reveal", cell: 999 }) === game);   // a move that cannot be made returns the same game
```

```text
ready null
playing dealt around cell 40 with 10 mines
true
```

### A hint that proves its answer

`hintFor` reads only what is opened, never the hidden mines, and says which cells are certain, and from which clue. Flags are marks and never evidence.

```ts
import { DEFAULT_SETTINGS, hintFor, newGame, play, visibleGame } from "@johnmorrisdotca/jirai";

let game = newGame({ ...DEFAULT_SETTINGS, seed: 42 });
game = play(game, { kind: "reveal", cell: 40 });
const hint = hintFor(visibleGame(game))!;
console.log(hint);
```

```text
{
  safe: [ 5 ],
  mines: [],
  reason: 'count',
  sources: [ 6 ],
  contradiction: false
}
```

### Solve a field with nothing but hints

A no-guess field can be finished by deduction alone, so a bot needs no luck: ask for a hint, open what is safe, flag what is a mine, and repeat. A medium field and a hex star at the hard level are both cleared.

```ts
import { DEFAULT_SETTINGS, gameProgress, hintFor, levelSettings, newGame, play, visibleGame } from "@johnmorrisdotca/jirai";

for (const [label, extra] of [["square", {}], ["hex star", { grid: "hex", shape: "star" }]] as const) {
  const level = label === "square" ? "medium" : "hard";
  const settings = { ...DEFAULT_SETTINGS, ...extra, ...levelSettings(level, extra), seed: 3, noGuess: true };
  let game = play(newGame(settings), { kind: "reveal", cell: Math.floor(settings.height / 2) * settings.width + Math.floor(settings.width / 2) });
  let hints = 0;
  while (game.status === "playing") {
    const hint = hintFor(visibleGame(game));
    if (hint === null || (hint.safe.length === 0 && hint.mines.length === 0)) break;
    hints += 1;
    for (const cell of hint.safe) game = play(game, { kind: "reveal", cell });
    for (const cell of hint.mines) if (game.marks[cell] !== "flag") game = play(game, { kind: "mark", cell });
  }
  console.log(label, game.status, `after ${hints} hints and ${game.moves.length} moves; saved in ${gameProgress(game).length} characters`);
}
```

```text
square won after 51 hints and 77 moves; saved in 2334 characters
hex star won after 34 hints and 50 moves; saved in 1601 characters
```

### Levels, outlines and huge fields

Four levels step up in size and mine share, on every rule and outline; a shaped board keeps the level's share of mines over the cells it has left. `hugeSettings` is the same on a field of four times the area.

```ts
import { hugeSettings, levelSettings } from "@johnmorrisdotca/jirai";

console.log(levelSettings("hard"));
console.log(levelSettings("extra-hard", { grid: "hex", shape: "star" }));
console.log(hugeSettings("hard"));
```

```text
{ width: 30, height: 16, mines: 99 }
{ width: 40, height: 24, mines: 85 }
{ width: 32, height: 32, mines: 211 }
```

### Deal a field and check it

`makeBoard` deals at a first cell; with `noGuess` it returns only a board its solver can finish. `measureBoard` grades it with the same deductions the hints use, so levels can be put in order.

```ts
import { DEFAULT_SETTINGS, isSolvable, makeBoard, measureBoard } from "@johnmorrisdotca/jirai";

const board = makeBoard({ ...DEFAULT_SETTINGS, noGuess: true, seed: 7 }, 40);
console.log(isSolvable(board), board.mines.filter(Boolean).length, "mines; dealt on attempt", board.attempt);
const grade = measureBoard(board);
console.log(`score ${grade.score}, depth ${grade.depth}, solvable ${grade.solvable}`);
```

```text
true 10 mines; dealt on attempt 0
score 27.2, depth 10, solvable true
```

### Who touches whom

The rule sets differ only in which cells a number counts. `neighbours` says, for any cell, which cells those are.

```ts
import { DEFAULT_SETTINGS, neighbours } from "@johnmorrisdotca/jirai";

for (const grid of ["square", "orthogonal", "hex", "wrap"] as const) {
  console.log(grid.padEnd(10), "cell 40:", neighbours({ ...DEFAULT_SETTINGS, grid }, 40).length, "neighbours; cell 0:", neighbours({ ...DEFAULT_SETTINGS, grid }, 0).length);
}
```

```text
square     cell 40: 8 neighbours; cell 0: 3 neighbours
orthogonal cell 40: 4 neighbours; cell 0: 2 neighbours
hex        cell 40: 6 neighbours; cell 0: 2 neighbours
wrap       cell 40: 8 neighbours; cell 0: 8 neighbours
```

### Keep a game and read it back

A saved game is the settings and the moves, not an answer anybody could edit. Reading it replays every move under the rules, so a record that is not a game is `null`.

```ts
import { DEFAULT_SETTINGS, gameFromProgress, gameProgress, newGame, play } from "@johnmorrisdotca/jirai";

let game = newGame({ ...DEFAULT_SETTINGS, seed: 42 });
game = play(game, { kind: "reveal", cell: 40 });
const saved = gameProgress(game);
console.log(saved);
console.log(gameFromProgress(saved)?.status, gameFromProgress("not a game"), gameFromProgress(saved.slice(0, 60)));
```

```text
{"version":1,"settings":{"width":9,"height":9,"mines":10,"grid":"square","noGuess":true,"opening":"clear","seed":42},"moves":[{"kind":"reveal","cell":40}],"helped":false}
playing null null
```

### Today's field

`dailySeed` is the same seed for everyone on a date (UTC), per rule set, so a site can offer a daily field with nothing stored.

```ts
import { dailySeed } from "@johnmorrisdotca/jirai";

console.log(dailySeed("2026-10-01"), dailySeed("2026-10-01", "hex"), dailySeed("2026-10-01") === dailySeed("2026-10-01"));
```

```text
1293497838 968579362 true
```

### Draw it yourself

`boardModel` is the board as row-major labelled cells with no DOM, for a page that draws its own. Each cell says where it is, what it reads aloud and what state it is in.

```ts
import { DEFAULT_SETTINGS, newGame, play } from "@johnmorrisdotca/jirai";
import { boardModel } from "@johnmorrisdotca/jirai/draw";

const game = play(newGame({ ...DEFAULT_SETTINGS, seed: 42 }), { kind: "reveal", cell: 40 });
const model = boardModel(game, {});
console.log(model.width, "by", model.height, "=", model.cells.length, "cells");
console.log(model.cells[40]);
```

```text
9 by 9 = 81 cells
{
  cell: 40,
  x: 4,
  y: 4,
  width: 1,
  height: 1,
  label: '5, 5: empty',
  text: '',
  kind: 'open',
  hint: false
}
```

### A player you steer from code

```ts no-run
import { DEFAULT_SETTINGS } from "@johnmorrisdotca/jirai";
import { mountJirai } from "@johnmorrisdotca/jirai/play";

const board = mountJirai(document.querySelector<HTMLElement>("#game")!, {
  settings: { ...DEFAULT_SETTINGS, grid: "wrap", seed: 7 },
  material: "slate",
  pieces: "flowers",
  language: "ja",
  onChange: () => localStorage.setItem("jirai", board.progress()),     // keep the game as it is played
  onFinish: (game) => console.log(game.status, game.helped),           // won or lost, and whether a hint was used
});
const kept = localStorage.getItem("jirai");
if (kept) board.load({ ...DEFAULT_SETTINGS, grid: "wrap", seed: 7 }, kept);   // play a kept game back
```

### A look of your own

The player is themed by custom properties, and `material` and `pieces` change how the cells and markers look, never the rules.

```css
jirai-board .jr-root[data-material] {   /* as specific as the material's own rule, so that it wins */
  --jr-cover: #cfd8dc;
  --jr-open: #eceff1;
  --jr-ink: #263238;
}
```

## Rules and settings

| Setting | Values and limits |
| --- | --- |
| `grid` | `square` (eight neighbours), `orthogonal` (four), `hex` (six), or `wrap` (eight; opposite edges join). |
| `shape` | `rectangle`, `heart`, `star` or `hexagon`; non-rectangles require at least 9 rows and columns. Wraparound requires `rectangle`. |
| `width`, `height` | 3–60 each, with at most 2,400 total cells. |
| `mines` | At least one, fewer than active cells, and low enough to leave the selected opening. |
| `noGuess` | If true, reject any deal the bounded deduction solver cannot finish from the opening. This proves the deal under this solver’s deductions, not a unique solution to every custom board. |
| `opening` | `safe` protects the first cell; `clear` also protects its neighbours. |
| `seed` | Integer from 0 through 4,294,967,295. A seed is interpreted together with all other settings and the first cell. |
| `material`, `pieces`, `language` | `ivory`, `wood`, `slate`; `flags`, `stones`, `flowers`; `en`, `ja`. |

## Levels

| Level | Size | Mines | Mines per cell | Old name |
| --- | --- | --- | --- | --- |
| `easy` | 9×9 | 10 | 12% | `beginner` |
| `medium` | 16×16 | 40 | 16% | `intermediate` |
| `hard` | 30×16 | 99 | 21% | `expert` |
| `extra-hard` | 40×24 | 240 | 25% | |

`levelNamed(name)` returns the level a name means (`extra-hard` may also be written `extra hard`, `extra_hard` or `extraHard`) or `null`. `levelSettings(level, { grid, shape })` returns `{ width, height, mines }`: a rectangle gets the numbers above, and a heart, star or hexagon outline keeps the level's width and height and its share of mines over the cells that are left. `PRESETS` holds the four levels, the three old names, and `wide` (21×9, 24) and `tall` (9×21, 24).

### Huge fields

`hugeSettings(level, { grid, shape, size })` is the same four levels on a field of four times the area of the medium one: 32×32 (1,024 squares), or 48×24 or 24×48 (1,152; `HUGE_SIZES` lists them) with the level's own share of the mines, so a 32×32 has 126 mines at `easy`, 160 at `medium`, 211 at `hard` and 256 at `extra-hard`, and a heart, star or hexagon outline keeps the share over the squares it has left. They are the same fields as any other: seeded, a safe opening, and every one proved to need no guess, on all four rule sets and all four outlines (`src/huge.test.ts`, and the winning of 32×32 fields at easy and extra-hard by the explained hints alone).

Measured on a Mac (20 cores, busy): dealing and proving a 32×32 takes a median of 3 ms at easy, 5 ms at medium, 11 ms at hard and 60 ms at extra-hard (the slowest of ten seeds 73 ms; 48×24 at extra-hard 54 ms median, 91 ms slowest); the orthogonal four-neighbour field, the hardest to finish, took 46 ms median and 87 ms slowest at 25%. The player deals in a worker, so the page is never held. A reveal or a flag on the 1,024-square board is answered in 4 ms of script on the desk and about 20 ms with the processor slowed fourfold, as a phone's is, and the next frame follows at once (36 ms with 2,400 squares, the most a field may have), so the board is plain buttons still and needs no canvas. The explained `hintFor` takes 8 ms on average and at most 43 ms late in a 32×32 extra-hard field (it was 51 and 400 before 0.4.0).

```ts
import { DEFAULT_SETTINGS, hugeSettings, newGame } from "@johnmorrisdotca/jirai";

const game = newGame({ ...DEFAULT_SETTINGS, ...hugeSettings("hard"), seed: 7 }); // 32 × 32, 211 mines
```

```ts
import { DEFAULT_SETTINGS, levelSettings, newGame } from "@johnmorrisdotca/jirai";

const game = newGame({ ...DEFAULT_SETTINGS, ...levelSettings("extra-hard", { grid: "hex", shape: "star" }), grid: "hex", shape: "star", seed: 7 });
```

The levels step up a measured difficulty. `measureBoard(board)` solves a dealt board with the same deductions the hints use and reports its `density`, the share of cells proved by anything beyond one clue's count (`multiStep`), the longest chain of deductions (`depth`), the cells proved by each kind of reasoning, and a `score` (`100 × density + 100 × multiStep + depth ÷ 4`) that puts boards in order. It is not a prediction of how long a person takes. Mean score of 30 seeds, rectangles, opening in the middle:

| Rule | easy | medium | hard | extra-hard |
| --- | --- | --- | --- | --- |
| square (8 neighbours) | 26 | 41 | 63 | 85 |
| orthogonal (4) | 18 | 26 | 38 | 49 |
| hexagonal (6) | 21 | 31 | 49 | 65 |
| wraparound (8) | 25 | 41 | 67 | 96 |

Orthogonal clues carry less information, so its numbers are smaller at every level; each level is still at least a quarter harder than the one before it on every rule.

## Engine and saved games

`newGame(settings)` returns an immutable ready game with no dealt mines. `play(game, move)` returns a new state; a move that cannot be made returns the original state. `visibleGame(game)` strips hidden mine locations. `hintFor(visibleGame)` reads only opened clues: flags are marks, never evidence. `makeBoard(settings, first, options?)` deals directly, and `isSolvable(board)` independently checks whether its deduction solver can finish. The solver runs the hint engine's deductions to a fixed point in one pass, and is tested to agree with `deduce` on every board.

`gameProgress(game)` saves the settings and move history, not an unchecked answer. `gameFromProgress(code)` replays and validates the moves, returning `null` for invalid data. The original square, hex and wraparound games use version 1 records. Orthogonal games use version 2 with `variant: "orthogonal"`; `decodeOrthogonalGame` accepts only those records. Keep this distinction when storing old games.

The full engine entry is `@johnmorrisdotca/jirai`; four-neighbour helpers are in `@johnmorrisdotca/jirai/orthogonal`. Drawing is `@johnmorrisdotca/jirai/draw`, browser play is `/play`, and the custom element is `/element` or `/element/define`. The [API guide](docs/API.md) lists the entries and public calls.

## API

Every export of every entry point is in the [API reference](https://johnmorrisdotca.github.io/jirai/api.html), made from the source when the demo is built, and the [API guide](docs/API.md) lists the entries and public calls in prose.

### Entry points

| Import | What it holds |
| --- | --- |
| `@johnmorrisdotca/jirai` | The rules engine, grid and shape utilities, levels, the dealer and solver, hints and saved progress |
| `@johnmorrisdotca/jirai/orthogonal` | The explicit four-neighbour game, board, hint and version-2 save helpers |
| `@johnmorrisdotca/jirai/draw` | `boardModel`, `JIRAI_STYLE` and the drawing model types |
| `@johnmorrisdotca/jirai/play` | `mountJirai` and the player's types and options |
| `@johnmorrisdotca/jirai/element` | `JiraiElement` and `defineJirai`, which registers nothing until called |
| `@johnmorrisdotca/jirai/element/define` | Defines `<jirai-board>` by being imported |
| `@johnmorrisdotca/jirai/react` | The optional `JiraiBoard` component; React is an optional peer |

### The calls to learn first

| Call | What it does |
| --- | --- |
| `newGame(settings)` and `play(game, move)` | A ready game, and the game after a move; a move that cannot be made returns the same game |
| `visibleGame(game)` and `hintFor(visible)` | What a player can see, and the cells that are certain from it |
| `makeBoard(settings, first, options)` and `isSolvable(board)` | A seeded field dealt at a first cell, and whether deduction can finish it |
| `levelSettings(level, options)` and `hugeSettings(level, options)` | The size and mines of a level, on any rule and outline |
| `gameProgress(game)` and `gameFromProgress(text)` | A game as text, and back; `null` for a record that is not a game |
| `boardModel(game, options)` | The board as labelled cells, for a page that draws its own |
| `mountJirai(element, options)` | The player |

## Theming

`boardModel(game, options)` returns row-major labelled cells without touching the DOM. The draw entry exports `JIRAI_STYLE` and the board model. The player uses the same theme variables as its SVG and HTML controls; set `material`, `pieces`, and `language` on mount or override the CSS custom properties in your host.

Materials are `ivory`, `wood` and `slate`. Marker sets are `flags`, `stones` and `flowers`. They change appearance only; the engine still stores covered, flag, question or open states.

| Property | What it colours | Ivory | Wood | Slate |
| --- | --- | --- | --- | --- |
| `--jr-ground` | the tray round the board | `#a98954` | `#ae804a` | `#252e32` |
| `--jr-cover` | a covered cell | `#fbf8f1` | `#e0bb7e` | `#455359` |
| `--jr-open` | an opened cell | `#efe8d8` | `#c69d63` | `#303c41` |
| `--jr-line` | the lines between cells | `#cfc6b2` | `#936e40` | `#62747a` |
| `--jr-ink` | the digits and marks | `#1f2320` | `#352c20` | `#f3f0e5` |
| `--jr-accent` | the cell a hint outlines | `#2f7a4f` | `#2f7a4f` | `#b7d298` |

They are set on `.jr-root`, and the material sets them again with `.jr-root[data-material=…]`, so a host rule must be as specific (`.jr-root[data-material]`) to win. The buttons take `--jr-ui-ink`, `--jr-ui-line` and `--jr-ui-surface`, which follow the page's `--ink`, `--rule` and `--surface` when it has them, as the family's demos do.

## Limits

The board is capped at 60 cells per side and 2,400 cells overall. Shapes need at least 9×9; wraparound is rectangular.

**How a no-guess field is dealt.** First the generator draws up to 128 random layouts (`attempts`), exactly as 0.2 did, so every field those versions dealt is dealt again, unchanged, for the same seed. If none of them can be finished by deduction it takes the closest and repairs it: single mines are moved next to the place the solver stopped, a move is kept when it leaves the solver no worse off, and the search starts over from a new layout when it stalls. The work is counted in layouts tried (`repairs`, 12 per cell by default), never in time, so a seed always gives the same field. Every field returned is proved by the same deductions either way; `board.attempt` at or above `attempts` says the field was repaired. `makeBoard(settings, first, { attempts, repairs, repair, enumerate })` accepts 1–10,000 attempts, 0–1,000,000 repairs, `repair: false` for the 0.2 behaviour of giving up after the random layouts, and `enumerate` to switch the exact small-frontier check. Failure raises `GenerationError` rather than returning a guessing field.

**Measured generation** (200 seeds for each rule, outline and level, with the opening on a random cell; Node 24 on one core of a shared laptop, so read the milliseconds as an order of magnitude). Every level on every combination dealt a verified field every time, except for the one case below. The slowest single deal in the whole run was 230 ms; the median at extra-hard, the largest and densest level, was 36 ms for a square rectangle (the slowest median), 25 ms orthogonal, 22 ms hexagonal and 3 ms wraparound; its 95th percentile was at most 55 ms. Before 0.3, orthogonal `expert` boards failed five times in six and square ones took over half a second.

| Level | Median | 95th percentile | Slowest |
| --- | --- | --- | --- |
| easy | 0.1–0.5 ms | 0.3–1.1 ms | 3.3 ms |
| medium | 0.2–1.7 ms | 0.4–3.1 ms | 3.6 ms |
| hard | 0.6–7.7 ms | 1.2–11.8 ms | 16.7 ms |
| extra-hard | 3–36 ms | 10–55 ms | 229 ms |

**What a field cannot do, and what is done about it.**

- A cell with no neighbours under the rules (a tip of an orthogonal or hexagonal star) can never be told by a clue. `makeBoard` refuses an opening on one with `GenerationError` code `"opening"` (open another cell), and a field whose opening can reach only part of the outline makes the cut-off cells mines, since nobody has to find a mine to win. This is the only case in which an extra-hard deal fails: 2 of 340 cells on an orthogonal star, 1 on a hexagonal star, 0 on any other outline.
- Extra-hard is not narrowed for any rule or outline: all of them reach 25% reliably. A custom field much denser than that is still not promised; it raises `GenerationError` when the work budget runs out.
- The widest fields (30 and 40 columns) scroll sideways inside the board on a narrow screen, as hard always has.

For synchronous server use, consider running a deal in a worker; a browser deals extra-hard in the board's own worker without a pause.

## Accessibility

- **Every cell is a button with a name.** A screen reader hears the cell's place and state ("5, 5: empty", "3, 2: flag", the number a clue shows), and the board is a labelled group, with `aria-busy` while a field is being dealt. `boardModel` gives the same label for a board you draw yourself.
- **The status line is spoken.** What to do next, what a hint proved and how the game ended is a `role="status"` line, so a change is announced without moving focus. A hint says which cell is certain and why, so it teaches the deduction as well as giving the answer.
- **The keyboard plays the whole game.** The board has one tab stop and the arrow keys move between cells; Enter opens, F or Space marks, and an open number whose flags match clears its neighbours. The buttons (Start over, Open or Mark, Hint, Just the board) are native buttons.
- **Touch and pointer.** Tap opens, a long press or right-click marks, and a Mark button switches a touch screen between opening and marking (`aria-pressed`), so nothing needs a long press. The buttons are at least 44 pixels high.
- **A number is not told by colour alone.** The clue is a digit, in a colour per value for those who see it; flags, stones and flowers are different shapes, not different colours, and every cell state has its name in the label.
- **Reduced motion.** The only transition, a cell's background, is on only for `prefers-reduced-motion: no-preference`.
- **Not yet.** The colour pairs of the three materials have not been measured against WCAG contrast ratios. A very wide field (30 and 40 columns) scrolls sideways inside its box on a narrow screen. The Japanese has not been read by a native reader (see [Languages](#languages)).

## Browser support

The browser player uses ES modules, SVG, custom elements, dialogs and module workers. Serve built files over HTTP; `file:` pages cannot load its worker. The engine and drawing functions do not need DOM globals. Development and tests require Node 22 or later.

## Languages

The player's words are English and Japanese, chosen with the `language` option or the `lang` attribute: the buttons, the status lines, the hints and the labels read by assistive technology. Corrections to the Japanese are welcome as issues.

## Roadmap

The engine, the dealer, the hints and the player are in. Nothing else is promised for a date; ideas are welcome in the [issues](https://github.com/johnmorrisdotca/jirai/issues).

## Architecture

```text
src/
├── deduce.ts
├── draw-entry.ts
├── draw.ts
├── element-define.ts
├── element.ts
├── enumerate.ts
├── flood.ts
├── game.ts
├── generate.ts
├── grid.ts
├── index.ts
├── jirai.constants.ts
├── jirai.types.ts
├── keep.ts
├── levels.ts
├── measure.ts
├── mount.ts
├── orthogonal.ts
├── play-entry.ts
├── random.ts
├── react.tsx
├── react.types.ts
├── repair.ts
├── shape.ts
├── solve.ts
├── strings.ts
├── style.ts
├── ui.types.ts
└── worker.ts
```

## The name

*Jirai* (地雷) is Japanese for a land mine, read じらい, said in three beats, *ji-ra-i*. It is made of 地 (*ji*,
ground) and 雷 (*rai*, thunder): a mine is thunder buried in the ground. Every number on the board is a clue to
where it lies. ([Wiktionary: 地雷](https://en.wiktionary.org/wiki/地雷).)

## Where it comes from, and where it is used

Minesweeper's rules are common property. Everything here, the rules, the dealer, the solver, the hints, the pictures and the words, is written for the package, and no third-party puzzle boards or artwork are included.

### Used by

Using Jirai in something? Open an *Add my project* issue and we will add you.

### The family

<!-- family:start (made by scripts/family-readme.mjs from scripts/family-template.mjs; change those, not this) -->
Jirai is one of twenty-four packages, each made for the same site, each at
[github.com/johnmorrisdotca](https://github.com/johnmorrisdotca). The code of every one is MIT.

- [Korokoro](https://github.com/johnmorrisdotca/korokoro) (コロコロ): dice, with notation, exact odds, real sounds and the dice of many games. [Demo](https://johnmorrisdotca.github.io/korokoro/).
- [Kyuubu](https://github.com/johnmorrisdotca/kyuubu) (キューブ): a turning cube for the browser, 2×2 to 7×7, with record solves to replay. [Demo](https://johnmorrisdotca.github.io/kyuubu/).
- [Hitotsu](https://github.com/johnmorrisdotca/hitotsu) (一つ): a colour-card shedding game for two to eight, with the house rules people play. [Demo](https://johnmorrisdotca.github.io/hitotsu/).
- [Toranpu](https://github.com/johnmorrisdotca/toranpu) (トランプ): a deck of playing cards, card games with computer players, and solitaires. [Demo](https://johnmorrisdotca.github.io/toranpu/).
- [Tane](https://github.com/johnmorrisdotca/tane) (種): seeded random numbers and daily seeds, the same in every browser and on every server. [Demo](https://johnmorrisdotca.github.io/tane/).
- [Narabe](https://github.com/johnmorrisdotca/narabe) (並べ): one rules engine for abstract board games, from gomoku and Reversi to Go and checkers. [Demo](https://johnmorrisdotca.github.io/narabe/).
- [Tenka](https://github.com/johnmorrisdotca/tenka) (天下): world conquest for two to six, on a map of the real world. [Demo](https://johnmorrisdotca.github.io/tenka/).
- [Kumimoji](https://github.com/johnmorrisdotca/kumimoji) (組み文字): a crossword tile race, in English and Japanese kana. [Demo](https://johnmorrisdotca.github.io/kumimoji/).
- [Tsunagi](https://github.com/johnmorrisdotca/tsunagi) (繋ぎ): a line-joining logic puzzle whose every level has exactly one answer. [Demo](https://johnmorrisdotca.github.io/tsunagi/).
- [Jarajara](https://github.com/johnmorrisdotca/jarajara) (ジャラジャラ): mahjong tiles drawn as SVG, stacked layouts, and the matching solitaire Awase. [Demo](https://johnmorrisdotca.github.io/jarajara/).
- [Suido](https://github.com/johnmorrisdotca/suido) (水道): a pipe puzzle: turn the pieces until the water reaches every drain. [Demo](https://johnmorrisdotca.github.io/suido/).
- [Domino](https://github.com/johnmorrisdotca/domino) (ドミノ): dominoes and Mexican Train. [Demo](https://johnmorrisdotca.github.io/domino/).
- [Kotoba](https://github.com/johnmorrisdotca/kotoba) (言葉): word lists and word-game rules in English, French, German and Japanese. [Demo](https://johnmorrisdotca.github.io/kotoba/).
- [Sugoroku](https://github.com/johnmorrisdotca/sugoroku) (双六): backgammon and its variants, with the doubling cube and match play. [Demo](https://johnmorrisdotca.github.io/sugoroku/).
- [Kazu](https://github.com/johnmorrisdotca/kazu) (数): grid number puzzles: Sudoku and its variants, Futoshiki and Skyscrapers. [Demo](https://johnmorrisdotca.github.io/kazu/).
- [Meikyuu](https://github.com/johnmorrisdotca/meikyuu) (迷宮): mazes on squares, hexagons, triangles and circles, made from a seed and drawn through with a finger or the mouse. [Demo](https://johnmorrisdotca.github.io/meikyuu/).
- [Hikidashi](https://github.com/johnmorrisdotca/hikidashi) (引き出し): a drawer of small Japanese text tools: era dates, kanji numerals, readings and sentence difficulty. [Demo](https://johnmorrisdotca.github.io/hikidashi/).
- [Chizu](https://github.com/johnmorrisdotca/chizu) (地図): maps of the world and of countries' regions, in English and Japanese, with a quiz and callouts. [Demo](https://johnmorrisdotca.github.io/chizu/).
- [Bushu](https://github.com/johnmorrisdotca/bushu) (部首): find a kanji by the parts it is made of. [Demo](https://johnmorrisdotca.github.io/bushu/).
- [Tobiishi](https://github.com/johnmorrisdotca/tobiishi) (飛び石): peg solitaire with nine boards and seeded solvable challenges. [Demo](https://johnmorrisdotca.github.io/tobiishi/).
- [Jirai](https://github.com/johnmorrisdotca/jirai) (地雷): minesweeper on shaped grids with verified no-guess boards. [Demo](https://johnmorrisdotca.github.io/jirai/).
- [Gunjin](https://github.com/johnmorrisdotca/gunjin) (軍人): five hidden-rank strategy games with pass-the-device play. [Demo](https://johnmorrisdotca.github.io/gunjin/).
- [Karakuri](https://github.com/johnmorrisdotca/karakuri) (からくり): eight hyper-casual puzzle games, some of them physics: draw a shield, pull pins, cut ropes, slide blocks, pour tubes. [Demo](https://johnmorrisdotca.github.io/karakuri/).
- [Houseki](https://github.com/johnmorrisdotca/houseki) (宝石): gem and stone matching puzzles: falling triplets, stone collapse, colour chains and gem swap. [Demo](https://johnmorrisdotca.github.io/houseki/).

**This package is Jirai.** The demos of all twenty-four share one header and footer, so each links the rest.
<!-- family:end -->

## Development

```sh
pnpm install --frozen-lockfile
pnpm check          # lint, types, tests and the presentation checks
pnpm test:package   # build and import the actual npm tarball
pnpm test:demo      # browser flows against the built page
pnpm site           # build the standalone page into site/
pnpm test:readme    # run every example in this README against the built package
pnpm screenshots:readme  # take the README's pictures from the built demo, in light and dark
```

The standalone game is `site/index.html`. The preview binds to `127.0.0.1:6713`; see [CONTRIBUTING.md](CONTRIBUTING.md) before changing the engine or player.

## Contributing

Bug reports and pull requests are welcome in the [issues](https://github.com/johnmorrisdotca/jirai/issues). See [CONTRIBUTING.md](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md) and the [Security policy](SECURITY.md).

## Changes

Every release is written up in [CHANGELOG.md](./CHANGELOG.md). The latest release, 0.4.2, adds no code: it is this README in full, with pictures of every rule set and outline, examples that are run on every change, examples for React, Vue, Svelte and Angular, and an Accessibility section.

## Licence

[MIT](LICENSE) © John Morris. No third-party puzzle boards or artwork are included.

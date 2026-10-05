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

<p align="center">
  <img src="docs/desktop.jpg" alt="Jirai on a desktop: the Minesweeper board and its shape, grid, size, mine-count and material controls in the shared family demo style" width="680">
  <img src="docs/phone.jpg" alt="Jirai on a phone: a square minefield with touch controls and clear number clues" width="220">
</p>

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

const settings = { width: 9, height: 9, mines: 10, noGuess: true, opening: "clear", seed: 42 };
const game = newOrthogonalGame(settings);
const board = makeOrthogonalBoard(settings, 40); // counts only edge-sharing neighbours
```

## What it does

- **Four rule sets:** square grids count eight neighbours, orthogonal grids count four, hex grids count six axial neighbours, and wraparound grids join opposite square edges.
- **Board outlines:** rectangles, hearts, stars and hexagon outlines. Shaped boards have cut-outs; wraparound works with rectangles.
- **A fair first move:** choose a safe first cell or a clear opening with all its neighbours safe.
- **Verified no-guess deals:** optional deduction-only dealing accepts a board only when the solver proves every safe cell from the opening. It throws `GenerationError` when the bounded search cannot prove one.
- **Fixed seeded fields:** after the opening, mines never move. A seed and settings reproduce the same deal.
- **Familiar play:** reveal, flag, question-mark, chord, flood-open, explained hint, timer, undo by saved replay, and a just-the-board dialog.
- **Accessible controls:** keyboard navigation, pointer and touch, long press to mark, English and Japanese strings, and board labels read by assistive technology.
- **Materials and markers:** ivory, wood or slate; flags, stones or flowers. Host CSS can replace the palette.

## Use it in a page

Mount a player into any element. The first reveal asks the module worker to deal the board, so serve the package over HTTP and allow same-origin module workers in your content security policy.

```ts
import { DEFAULT_SETTINGS, mountJirai } from "@johnmorrisdotca/jirai/play";

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

Use the custom element without a mount call:

```html
<script type="module">
  import "@johnmorrisdotca/jirai/element/define";
</script>
<jirai-board width="9" height="9" mines="10" seed="42"
  grid="orthogonal" opening="clear" no-guess="true"
  material="wood" pieces="stones" lang="ja"></jirai-board>
```

The optional React entry exports `JiraiBoard` from `@johnmorrisdotca/jirai/react`; React is an optional peer dependency. Its options are read when mounted. Use a new React `key` to start with a different settings object.

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

The built-in presets are beginner (9×9, 10 mines), intermediate (16×16, 40), expert (30×16, 99), wide (21×9, 24), and tall (9×21, 24). They are starting points, not calibrated difficulty ratings.

## Engine and saved games

`newGame(settings)` returns an immutable ready game with no dealt mines. `play(game, move)` returns a new state; a move that cannot be made returns the original state. `visibleGame(game)` strips hidden mine locations. `hintFor(visibleGame)` reads only opened clues: flags are marks, never evidence. `makeBoard(settings, first, options?)` deals directly, and `isSolvable(board)` independently checks whether its deduction solver can finish.

`gameProgress(game)` saves the settings and move history, not an unchecked answer. `gameFromProgress(code)` replays and validates the moves, returning `null` for invalid data. The original square, hex and wraparound games use version 1 records. Orthogonal games use version 2 with `variant: "orthogonal"`; `decodeOrthogonalGame` accepts only those records. Keep this distinction when storing old games.

The full engine entry is `@johnmorrisdotca/jirai`; four-neighbour helpers are in `@johnmorrisdotca/jirai/orthogonal`. Drawing is `@johnmorrisdotca/jirai/draw`, browser play is `/play`, and the custom element is `/element` or `/element/define`. The [API guide](docs/API.md) lists the entries and public calls.

## Drawing and theming

`boardModel(game, options)` returns row-major labelled cells without touching the DOM. The draw entry exports `JIRAI_STYLE` and the board model. The player uses the same theme variables as its SVG and HTML controls; set `material`, `pieces`, and `language` on mount or override the CSS custom properties in your host.

Materials are `ivory`, `wood` and `slate`. Marker sets are `flags`, `stones` and `flowers`. They change appearance only; the engine still stores covered, flag, question or open states.

## Limits and browser support

The board is capped at 60 cells per side and 2,400 cells overall. Shapes need at least 9×9; wraparound is rectangular. The no-guess generator tries at most 128 candidates by default. `makeBoard(settings, first, { attempts })` accepts 1–10,000 attempts and can enable or disable local enumeration with `enumerate`; failure raises `GenerationError` rather than silently returning a guessing field. Very dense or shaped boards may exhaust that budget. For synchronous server use, consider running difficult custom settings in a worker.

The browser player uses ES modules, SVG, custom elements, dialogs and module workers. Serve built files over HTTP; `file:` pages cannot load its worker. The engine and drawing functions do not need DOM globals. Development and tests require Node 22 or later.

## The name

*Jirai* (地雷) is Japanese for a land mine, read じらい, said in three beats, *ji-ra-i*. It is made of 地 (*ji*,
ground) and 雷 (*rai*, thunder): a mine is thunder buried in the ground. Every number on the board is a clue to
where it lies. ([Wiktionary: 地雷](https://en.wiktionary.org/wiki/地雷).)

## Development

```sh
pnpm install --frozen-lockfile
pnpm check          # lint, types and tests
pnpm test:package   # build and import the actual npm tarball
pnpm test:demo      # browser flows against the built page
pnpm site           # build the standalone page into docs/
```

The standalone game is `docs/index.html`. The preview binds to `127.0.0.1:6713`; see [CONTRIBUTING.md](CONTRIBUTING.md) before changing the engine or player.

## Licence

[MIT](LICENSE) © John Morris. No third-party puzzle boards or artwork are included.

## The family

<!-- family:start (made by scripts/family-readme.mjs from scripts/family-template.mjs; change those, not this) -->
Jirai is one of twenty-two packages, each made for the same site, each at
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

**This package is Jirai.** The demos of all twenty-two share one header and footer, so each links the rest.
<!-- family:end -->

## Contributing and security

See [Contributing](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md) and the [Security policy](SECURITY.md).

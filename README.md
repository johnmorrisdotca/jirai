# Jirai 地雷

**Every number is a clue.** Minesweeper on four-neighbour orthogonal and eight-neighbour square grids, hexagons, or a board whose opposite edges join. Clear the ground, mark the mines, and finish a field made from a seed.

Plain TypeScript rules, no runtime dependencies. The rules work without a browser; the playable board works in any page. A React wrapper and a custom element are separate imports.

## What it does

- Orthogonal four-neighbour, square eight-neighbour, hexagonal and wraparound boards, with width, height and mine count of your own.
- Rectangle, heart, star and hexagon outlines; wide and tall presets. Cut-outs are outside the playable field.
- A safe first cell, or a clear opening with all its neighbours safe.
- Verified no-guess fields. A bounded generator throws `GenerationError` if it cannot prove a board; it never substitutes an ordinary field.
- Fixed mines after the opening, seeded deals, replayable progress and daily seeds.
- Flood opening, flags and question marks, chording, explained hints, a clock and a just-the-board dialog.
- Wood, ivory or slate; flags, stones or flowers. Host CSS may replace the palette.
- English and Japanese, mouse, touch, long press, and keyboard navigation.
- Browser generation runs in a module worker, so searching for a no-guess field does not block input.

## Start a game

Once published:

```sh
npm install @johnmorrisdotca/jirai
```

The present checkout is a release candidate; its repository URL and package name are intended destinations, not a claim that it has been published.

```ts
import { DEFAULT_SETTINGS, newGame, play, visibleGame, hintFor } from "@johnmorrisdotca/jirai";

let game = newGame({ ...DEFAULT_SETTINGS, width: 16, height: 16, mines: 40, seed: 42 });
game = play(game, { kind: "reveal", cell: 136 });
game = play(game, { kind: "mark", cell: 0 });
const hint = hintFor(visibleGame(game));
```

Every move returns a new game and leaves its input untouched. A move which is unavailable returns the game given. The first reveal deals the board. A mark made before it does not influence the deal.

`Settings.shape` may be `rectangle` (the default), `heart`, `star` or `hexagon`. Shaped fields require at least 9 cells on each side and work on square or hexagonal grids; wraparound requires a rectangle. `activeCells(settings)` returns playable row-major cells and `activeCell(settings, cell)` tests membership. Outside cells have clue −2, never contain mines and are excluded from neighbours, solving, drawing and winning. Mine count must be less than the playable cell count.

The dedicated `@johnmorrisdotca/jirai/orthogonal` entry provides `newOrthogonalGame`, `makeOrthogonalBoard`, `orthogonalNeighbours`, `orthogonalHint`, `encodeOrthogonalGame` and `decodeOrthogonalGame`. It applies four-neighbour rules explicitly, so callers do not need to thread a topology string through setup.

The demo uses the family’s original shared stylesheet and header template, with its five table-cloth choices and bilingual Help controls.

Cells are row-major numbers, zero first: `cell = row * width + column`. Orthogonal clues count only the four edge-sharing cells. Square boards count eight neighbours. Hex boards use axial coordinates: neighbours are left, right, above, above-right, below-left and below. A wrap board joins both opposite edges of a square grid.

```ts
import { mountJirai } from "@johnmorrisdotca/jirai/play";

const board = mountJirai(document.querySelector<HTMLElement>("#board")!, {
  settings: { ...DEFAULT_SETTINGS, grid: "hex", seed: 7 },
  material: "wood",
  pieces: "stones",
  language: "en",
  onChange(game) { /* save gameProgress(game) */ },
  onFinish(game) { /* game.status is won or lost */ },
  onError(error) { /* show a generation or worker-loading error */ },
});

board.set({ material: "slate", language: "ja" });
board.restart();
board.destroy();
```

The handle also offers `game()`, `progress()`, `load(settings, progress?)`, `play(cell, mark?)`, and `hint()`. `controls: false` gives a bare board for a host which supplies its own controls, status and timer. Events `jirai-change` and `jirai-finish` are dispatched on the host.

The engine's `Game` contains the answer. Keep that in the process doing the checking. `visibleGame` removes all hidden clues and is the only input the hint solver reads; a player's flags never count as evidence. This is a local puzzle, not a secure multiplayer protocol.

## In a framework

```tsx
import { JiraiBoard } from "@johnmorrisdotca/jirai/react";
<JiraiBoard key={seed} settings={{ ...DEFAULT_SETTINGS, seed }} material="wood" />
```

Options are read when mounted; a new key starts a different board. `onChange`, `onFinish` and `onError` stay current.

Vue, Svelte and Angular can call `mountJirai` on their element in the mount lifecycle and call `destroy` when it leaves. Or use the tag:

```html
<script type="module">
  import "@johnmorrisdotca/jirai/element/define";
</script>
<jirai-board grid="hex" width="9" height="9" mines="10" seed="7"
  no-guess="true" material="wood" pieces="stones" lang="ja"></jirai-board>
```

Use your bundler or an import map to resolve the package name. The worker is `dist/worker.js`, resolved beside the mounting module; serve the built files over HTTP and allow module workers in your CSP. It is included in the npm tarball. A deployment that rewrites module paths must keep this worker URL working too.

## Keep a game

```ts
import { gameProgress, gameFromProgress, dailySeed } from "@johnmorrisdotca/jirai";
const saved = gameProgress(game);
const restored = gameFromProgress(saved); // null for an invalid record
const seed = dailySeed("2026-10-04", "hex");
```

Ordinary grids keep version 1 progress records. Orthogonal records use version 2 and an explicit `variant: "orthogonal"` marker; `decodeOrthogonalGame` accepts only those records. Existing square, hex and wraparound records keep their format and meaning. A seed is only the start of a board's identity: width, height, mine count, grid, no-guess setting, opening policy and first cell matter too. Daily play uses UTC, beginner settings, and the centre opening. The demo's share link includes the first cell after a field has been dealt. Its local save restores the moves, but does not restore elapsed time.

## The no-guess promise

The generator deals candidates and plays them using deductions made from visible clues. It uses local counts, differences between contained clue sets, the total mine count, and complete enumeration of small connected frontiers. Enumeration stops at a fixed work budget and discards incomplete results. A candidate is accepted only when all safe cells were reached by proved moves.

This is deliberately conservative. Failing to prove a board does not mean no human could solve it. Very dense custom fields or large expert boards may exceed the search budget. Call `makeBoard(settings, first, { attempts })` to set the candidate budget (1–10000; default 128). Server generation is synchronous; run it in a worker when serving large boards. The mounted browser board already does so.

Hints identify a certain safe cell or mine and say which deduction proved it. They do not offer approximate probabilities. Chording still requires correctly placed flags: a matched count of incorrect flags can expose a mine.

## Build and check

```sh
pnpm install
pnpm check
pnpm test:package
pnpm exec playwright install chromium
pnpm test:demo
pnpm site
node scripts/serve.mjs
```

The generated standalone page is in `docs/`; the preview serves only on `127.0.0.1:6713`. The tests include an exhaustive independent small-board oracle for solver soundness, deterministic dealing, flood/chord rules, immutable moves, replay, and phone/desktop browser flows. The package check installs the actual tarball into an empty temporary project and imports it in Node.

## Architecture

Rules: `jirai.types.ts`, `jirai.constants.ts`, `grid.ts`, `random.ts`, `generate.ts`, `flood.ts`, `game.ts`, `deduce.ts`, `enumerate.ts`, `keep.ts`, `orthogonal.ts`.

Drawing and play: `draw.ts`, `style.ts`, `strings.ts`, `mount.ts`, `worker.ts`, `ui.types.ts`. Framework and tag wrappers are separate entries.

Types and domain constants are kept beside their modules. A new grid is a topology row, not a second copy of the rules. A theme changes drawing, never the answer.

## References

[Simon Tatham's Mines](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/mines.html) is the reference for no-guess play, alternate tilings and wrapping. [David Hill's JSMinesweeper](https://github.com/DavidNHill/JSMinesweeper) is the reference for analysis, opening choices and chording. This implementation does not incorporate their source code.

The package follows the pure rules / separate draw / separate play structure of [Suido](https://github.com/johnmorrisdotca/suido), and the optional React wrapper pattern used by Tenka. MIT © John Morris.

A run has `helped: true` after a proved hint is shown. This flag survives saved progress and lets a host distinguish assisted finishes. It is client-side state, not a competitive score verification mechanism.

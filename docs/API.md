# Jirai API

Jirai has a pure rules engine, a drawing model, a browser player, and optional framework wrappers. Imports are split so a server can use the engine without loading page code.

## Entries

| Import | Exports |
| --- | --- |
| `@johnmorrisdotca/jirai` | Engine, grid/shape utilities, generation, hints and saved progress. |
| `@johnmorrisdotca/jirai/orthogonal` | Explicit four-neighbour game, board, neighbour, hint and version-2 save helpers. |
| `@johnmorrisdotca/jirai/draw` | `boardModel`, `JIRAI_STYLE` and drawing model types. |
| `@johnmorrisdotca/jirai/play` | `mountJirai`, player types and options. |
| `@johnmorrisdotca/jirai/element` | `JiraiElement`, `defineJirai`. |
| `@johnmorrisdotca/jirai/element/define` | Defines `<jirai-board>` on import. |
| `@johnmorrisdotca/jirai/react` | Optional `JiraiBoard` React component and props. React is an optional peer. |

## Rules and generation

- `newGame(settings?)` creates a ready immutable game without a dealt board.
- `play(game, { kind, cell })` applies `reveal`, `mark` or `chord`; invalid moves return the same game.
- `makeBoard(settings, first, { attempts?, enumerate? }?)` deals at the first cell. No-guess mode returns only a board proved solvable from that opening; exhaustion throws `GenerationError` (`settings`, `opening` or `exhausted`).
- `isSolvable(board, enumerate?)` verifies a completed deal using the visible clues.
- `visibleGame(game)` removes hidden mine positions. `deduce(visible, knownMines?, enumerate?)` and `hintFor(visible)` return certain deductions, their reason, source clues and contradiction status.
- `neighbours(settings, cell)`, `neighboursOf(settings)`, `activeCell(settings, cell)` and `activeCells(settings)` describe topology and playable shapes.
- `DEFAULT_SETTINGS`, `PRESETS`, `GRIDS`, `MARKS`, `MOVES` and `STATUSES` provide defaults and stable enum-like values.

## Orthogonal rules variant

`OrthogonalSettings` is `Settings` without `grid`. `newOrthogonalGame(settings)` starts a four-neighbour game; `makeOrthogonalBoard(settings, first, options?)` deals it; `orthogonalNeighbours(settings, cell)` returns its adjacent cells; and `orthogonalHint(game)` reads its opened clues only. `encodeOrthogonalGame` writes the explicit version-2 variant record. `decodeOrthogonalGame(code)` rejects other variants and versions.

## Saving

`gameProgress(game)` returns JSON with validated settings, replayable moves and the assisted flag. It omits the hidden answer. `gameFromProgress(code)` replays the moves and returns `null` for malformed or inconsistent records. `dailySeed(day, grid?)` returns a UTC-derived seed for a valid `YYYY-MM-DD` date.

## Page player

`mountJirai(host, options)` mounts once and returns `game()`, `progress()`, `play(cell, mark?)`, `hint()`, `restart()`, `load(settings, progress?)`, `set(drawOptions)` and `destroy()`. Options include `settings`, `progress`, `controls`, `material`, `pieces`, `language`, `hint` and `onChange`, `onFinish`, `onError` callbacks.

The player dispatches `jirai-change` and `jirai-finish` with a copy of the public game state. The first reveal uses a module worker; serve the package over HTTP and allow same-origin workers in the page's CSP.

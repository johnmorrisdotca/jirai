---
title: Prove hints from visible clues
section: how-to
order: 4
description: Use VisibleGame and distinguish flags, proof and contradictions.
---

## Pass the visible projection

```ts
import { newGame,play,visibleGame,hintFor,type Settings } from "@johnmorrisdotca/jirai";
const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
const game=play(newGame(settings),{kind:"reveal",cell:0});
const hint=hintFor(visibleGame(game));
console.log(hint.safe,hint.mines,hint.reason,hint.contradiction);
```

`VisibleGame` contains opened clues and marks. Hidden clues, including flags, are null. A player’s flag is not a proved mine. Supply `knownMines` only for earlier proof results. `Deduction` reports certain safe cells, certain mines, the native reason and the source clues. An empty result means no proof was found by the enabled bounded deductions; it is not permission to guess automatically.

## Keep answers at the trusted boundary

`Game.board` and a dealt `Board` include mine locations for the rules engine and generation checks. Use the visible projection for hints and public display before the game ends. `contradiction` identifies inconsistent visible constraints. Showing a proved hint records assistance in the native player; keep that marker in saved progress.

---
title: Save progress and preserve variants
section: how-to
order: 5
description: Replay validated moves and retain orthogonal version-2 markers.
---

## Save settings and moves

```ts
import { newGame,play,gameProgress,gameFromProgress,type Settings } from "@johnmorrisdotca/jirai";
const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
const game=play(newGame(settings),{kind:"reveal",cell:0});
console.log(gameFromProgress(gameProgress(game))?.status,gameFromProgress("not a save"));
```

Progress stores settings and ordered moves, not an unchecked final answer array. Loading rebuilds the field under its rules and replays each legal move. Invalid, unsupported or unavailable records return null. Preserve the `helped` marker. Host code owns storage and should handle a refused record explicitly.

## Orthogonal compatibility

The older square/hex/wrap format uses version 1. Orthogonal records use version 2 plus the orthogonal variant marker. `decodeOrthogonalGame` returns null for another variant. Keep the topology with a daily seed or save; four-neighbour deductions and clues are not interchangeable with eight-neighbour ones. Existing level aliases remain accepted, but unknown names return null.

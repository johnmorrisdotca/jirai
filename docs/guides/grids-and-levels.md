---
title: Select topology, shapes and levels
section: how-to
order: 2
description: Keep row-major active-cell indices and validate topology-specific settings.
---

## Use the native presets

```ts
import { levelSettings,neighbours,validSettings,activeCells,type Settings } from "@johnmorrisdotca/jirai";
const settings: Settings={...levelSettings("easy",{grid:"orthogonal"}),grid:"orthogonal",noGuess:true,opening:"clear",seed:42};
console.log(validSettings(settings),neighbours(settings,0),activeCells(settings).length);
```

Square, orthogonal, hexagonal and wraparound grids have different neighbours. Orthogonal means four orthogonal neighbours. Shape masks omit cells while indices remain row-major across the full width/height; use `activeCells` rather than treating omitted cells as playable. Wrap requires a rectangle. The native limits are `MAX_SIDE` and `MAX_CELLS`.

## Preserve compatible level names

Easy, medium, hard and extra-hard are current names; beginner/intermediate/expert remain accepted aliases. `levelNamed` returns null for unknown input. `hugeSettings` changes dimensions and mine count; it does not deal a field. A huge no-guess field still needs a valid protected opening and bounded generation.

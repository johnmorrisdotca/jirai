---
title: Getting started
section: tutorial
order: 1
description: Reveal a small native field and read its visible clues.
---

## Reveal the opening

```ts
import { newGame,play,visibleGame,type Settings } from "@johnmorrisdotca/jirai";
const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
const ready=newGame(settings);
const game=play(ready,{kind:"reveal",cell:0});
console.log(ready.status,game.status,visibleGame(game).clues);
```

A game starts ready, with no dealt board. The first reveal chooses the protected opening and deals from its seed. `safe` protects that cell; `clear` also protects its neighbours. This small example disables no-guess verification to keep the basic reveal bounded. [Generation](bounded-generation.md) explains proved no-guess fields and explicit failures.

## Choose an entry

The main entry supplies rules, deductions, generation and progress. `/orthogonal` names the four-neighbour variant. `/draw` builds display models; `/play` mounts the native player. `/element` and `/element/define` supply and register the tag. `/react` is optional and uses the installed React peer.

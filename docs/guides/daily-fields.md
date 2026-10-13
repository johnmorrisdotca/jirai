---
title: Share a UTC daily field
section: how-to
order: 6
description: Pin a real date, topology, settings and opening for reproducible daily play.
---

## Use a real UTC date

```ts
import { dailySeed,newGame,type Settings } from "@johnmorrisdotca/jirai";
const settings: Settings={width:3,height:3,mines:1,grid:"orthogonal",noGuess:false,opening:"safe",seed:dailySeed("2024-01-01","orthogonal")};
console.log(settings.seed,newGame(settings).status);
```

`dailySeed` requires a real YYYY-MM-DD date and uses the variant’s native seed format. A local calendar day can differ from UTC. A pinned date recreates that day; the embed’s `today` option follows the UTC day when loaded. It does not make all settings or opening cells equivalent.

## Keep the recipe with the link

Preserve grid, shape, dimensions, mine count, opening policy and first cell, plus package version and generation options. The first reveal is part of the deal. A shared numeric seed alone cannot identify a full board when those inputs differ. The [embed contract](../embeds.md) covers day parsing, attribute reflection and public events.

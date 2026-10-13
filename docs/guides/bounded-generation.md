---
title: Generate verified no-guess fields
section: how-to
order: 3
description: Keep seed, opening and budgets explicit; generation failure is never an unproved board.
---

## Request a proved field

```ts
import { makeBoard,isSolvable,GenerationError,type Settings } from "@johnmorrisdotca/jirai";
const settings: Settings={width:5,height:5,mines:2,grid:"square",noGuess:true,opening:"clear",seed:42};
try {
 const board=makeBoard(settings,0,{attempts:8,repair:false});
 console.log(board.attempt,isSolvable(board));
} catch(error) {
 if(!(error instanceof GenerationError)) throw error;
 console.log(error.code);
}
```

The seed fixes the candidate stream for the same settings and opening. Generation first tries random layouts, then can repair a promising candidate by moving mines. Both routes use the native deduction proof. `attempt` identifies the accepted candidate/repair stage. For a reproducible lesson, pin package version, topology, shape, dimensions, mine count, first cell and generation options as well as seed.

## Handle failure as failure

`GenerationError` distinguishes invalid settings, an impossible protected opening and an exhausted budget. A clear opening can protect too many active cells to fit the mines, and an isolated opening may permit no useful deduction. A no-guess failure does not quietly return a guessing field. `repair:false` or zero repairs retains the earlier attempts-only policy. Exact enumeration is bounded by the exported frontier/node limits.

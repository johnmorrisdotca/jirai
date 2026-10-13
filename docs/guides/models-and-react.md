---
title: Draw a model or mount a React host
section: how-to
order: 7
description: Keep visible presentation data separate from game answers and mount ownership.
---

## Read the native display model

```ts
import { newGame,type Settings } from "@johnmorrisdotca/jirai";
import { boardModel } from "@johnmorrisdotca/jirai/draw";
const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
const model=boardModel(newGame(settings),{language:"ja",material:"wood",pieces:"flowers"});
console.log(model.width,model.height,model.cells[0]?.label);
```

The model supplies active-cell layout, public text, kind and accessible label. Covered cells follow the native display rules; the completed/lost board can show its outcome. Styling is supplied by `JIRAI_STYLE` for native markup. Material and piece choices are appearance settings rather than different deduction rules.

## React ownership

```ts no-run
import { createElement } from "react";
import { JiraiBoard } from "@johnmorrisdotca/jirai/react";
console.log(createElement(JiraiBoard,{language:"ja",material:"wood",controls:true}).type);
```

React owns the host div; the native mount owns the board and cleanup. Initial settings/progress/presentation are read on mount, so use a new React key to load a different board or initial setup. Callback refs are refreshed by the wrapper. React remains an optional peer; the pure engine does not import it.

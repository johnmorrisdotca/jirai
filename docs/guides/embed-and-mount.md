---
title: Embed and control a native board
section: how-to
order: 8
description: Use native mounts, events, reflected settings and cleanup.
---

## Keep the mount handle

```ts no-run
import { mountJirai } from "@johnmorrisdotca/jirai/play";
const host=document.createElement("div");
document.body.append(host);
const board=mountJirai(host,{language:"ja",onChange:game=>console.log(game.status),onError:error=>console.log(error.message)});
board.set({material:"wood",pieces:"flowers"});
console.log(board.game().status,board.progress().length);
board.destroy();
```

`play`, `hint`, `restart`, `load`, `set` and `destroy` use the native implementation. Host code owns persistence. Trusted host callbacks receive native game data, while the frame’s public messages follow the narrower embed contract. Validate message origin/source before using it.

## Copy a builder recipe

Choose topology, level/dimensions, shape, seed/day, opening, no-guess generation, material, pieces, language and controls. Invalid settings are refused. The builder supplies version-pinned frames, custom elements, module and framework recipes. Read the [complete embed guide](../embeds.md) for reflected aliases, day behavior and events. Docs follows initial/live page language, and API export anchors remain available.

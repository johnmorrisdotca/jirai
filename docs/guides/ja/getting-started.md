---
title: はじめに
section: tutorial
order: 1
description: 小さい標準の盤を開き、見える数字を読みます。
---

## 最初のマスを開く

```ts
import { newGame,play,visibleGame,type Settings } from "@johnmorrisdotca/jirai";
const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
const ready=newGame(settings);
const game=play(ready,{kind:"reveal",cell:0});
console.log(ready.status,game.status,visibleGame(game).clues);
```

ゲームは、まだ地雷を配置していない ready の状態で始まります。最初のマスを開くと、安全にする範囲を決め、シードから盤を作ります。`safe` はそのマス、`clear` は近隣のマスも守ります。この小さい例は、最初の操作を確かめるため、推測不要の検証を切っています。[生成](bounded-generation.md)に、検証した盤と失敗の扱いがあります。

## 入口を選ぶ

主な入口には規則、推論、生成、保存があります。`/orthogonal` は四近傍の形式です。`/draw` は表示モデル、`/play` は標準のプレイヤーを作ります。`/element` と `/element/define` は要素と登録です。`/react` は任意で、インストールした React を使います。

---
title: 見える数字からヒントを証明する
section: how-to
order: 4
description: VisibleGame を使い、旗と証明、矛盾を区別します。
---

## 見える状態を渡す

```ts
import { newGame,play,visibleGame,hintFor,type Settings } from "@johnmorrisdotca/jirai";
const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
const game=play(newGame(settings),{kind:"reveal",cell:0});
const hint=hintFor(visibleGame(game));
console.log(hint.safe,hint.mines,hint.reason,hint.contradiction);
```

`VisibleGame` は、開いた数字と印を持ちます。隠れた数字は旗のマスでも null です。利用者の旗は、証明した地雷ではありません。`knownMines` には、以前に証明した結果を渡します。`Deduction` は、安全なマス、地雷、推論の種類、根拠のマスを返します。空の結果は、有効な上限付きの推論で証明を見つけられなかった意味です。自動で推測してよい意味ではありません。

## 答えを使う場所を分ける

`Game.board` と生成した `Board` は、規則と生成の確認のために地雷の位置を持ちます。終了前のヒントや公開の表示には、見える状態を使います。`contradiction` は、見える条件の矛盾です。標準のヒントを表示した場合、保存した進み具合にもヒント使用の記録を保ちます。

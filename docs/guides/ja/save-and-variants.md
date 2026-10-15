---
title: 進み具合と形式を保って保存する
section: how-to
order: 5
description: 移動を検証して再生し、四近傍の版2の情報を保ちます。
---

## 設定と移動を保存する

```ts
import { newGame,play,gameProgress,gameFromProgress,type Settings } from "@johnmorrisdotca/jirai";
const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
const game=play(newGame(settings),{kind:"reveal",cell:0});
console.log(gameFromProgress(gameProgress(game))?.status,gameFromProgress("not a save"));
```

保存するのは、設定と移動順です。未確認の最終的な答えの配列ではありません。読み込みは、規則から盤を作り直し、合法な移動を再生します。不正な形式、未対応の版、再現できない記録はnullです。`helped`の記録を保ちます。保存先はページ側で選び、読み込めない場合を明確に扱います。

## 四近傍の互換性

以前の正方形・六角形・端がつながる形式は版1です。四近傍は版2とorthogonalの印を使います。別の形式は`decodeOrthogonalGame`がnullを返します。日付のシードや保存にも、近傍の種類を保ってください。4方向と8方向では、数字と推論が異なります。以前のレベル名も使えますが、不明な名前はnullです。

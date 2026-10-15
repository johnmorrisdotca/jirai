---
title: UTCの日付で問題を共有する
section: how-to
order: 6
description: 実在する日付、近傍、設定、開始位置をそろえて共有します。
---

## 実在するUTCの日付を使う

```ts
import { dailySeed,newGame,type Settings } from "@johnmorrisdotca/jirai";
const settings: Settings={width:3,height:3,mines:1,grid:"orthogonal",noGuess:false,opening:"safe",seed:dailySeed("2024-01-01","orthogonal")};
console.log(settings.seed,newGame(settings).status);
```

`dailySeed`は、実在するYYYY-MM-DDの日付を受け取り、その形式のシードを使います。端末の日付とUTCは、異なる場合があります。日付を固定すればその日を再現でき、埋め込みの`today`は読み込み時のUTCの日付に従います。異なる設定や開始位置を同じ盤にするものではありません。

## リンクに設定も保つ

近傍、形、大きさ、地雷数、開始時の安全範囲、最初のマス、版、生成の設定をそろえます。最初に開くマスも生成の入力です。これらが違う場合、同じ数値のシードだけでは盤を決められません。[埋め込みの仕様](../../embeds.md)に、日付、属性、公開イベントを記載しています。

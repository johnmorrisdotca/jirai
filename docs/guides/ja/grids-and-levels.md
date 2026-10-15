---
title: 近傍・形・レベルを選ぶ
section: how-to
order: 2
description: 有効なマスの番号を使い、近傍に合う設定を確認します。
---

## 標準の設定を使う

```ts
import { levelSettings,neighbours,validSettings,activeCells,type Settings } from "@johnmorrisdotca/jirai";
const settings: Settings={...levelSettings("easy",{grid:"orthogonal"}),grid:"orthogonal",noGuess:true,opening:"clear",seed:42};
console.log(validSettings(settings),neighbours(settings,0),activeCells(settings).length);
```

正方形、四近傍、六角形、端がつながる盤では、近隣のマスが異なります。四近傍は上下左右の4方向です。形によってマスを除いても、番号は盤全体の幅と高さに沿う行順です。除いたマスを使わず、`activeCells`で確かめます。端がつながる盤には長方形が必要です。上限は`MAX_SIDE`と`MAX_CELLS`です。

## 以前のレベル名を保つ

現在はeasy、medium、hard、extra-hardです。beginner、intermediate、expertも別名として使えます。不明な入力は`levelNamed`がnullを返します。`hugeSettings`は大きさと地雷数を決め、まだ盤は生成しません。大きい推測不要の盤にも、安全な開始位置と生成の上限が必要です。

---
title: 表示モデルとReactのホストを使う
section: how-to
order: 7
description: 表示する情報と答え、表示先の管理を分けます。
---

## 標準の表示モデルを読む

```ts
import { newGame,type Settings } from "@johnmorrisdotca/jirai";
import { boardModel } from "@johnmorrisdotca/jirai/draw";
const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
const model=boardModel(newGame(settings),{language:"ja",material:"wood",pieces:"flowers"});
console.log(model.width,model.height,model.cells[0]?.label);
```

モデルには、有効なマスの位置、表示する文字、種類、読み上げ名があります。閉じたマスは標準の表示規則に従い、終了や負けの後には結果を表示できます。標準のマークアップには`JIRAI_STYLE`を使います。素材と印は見た目の設定で、推論の規則は変えません。

## Reactの表示先

```ts no-run
import { createElement } from "react";
import { JiraiBoard } from "@johnmorrisdotca/jirai/react";
console.log(createElement(JiraiBoard,{language:"ja",material:"wood",controls:true}).type);
```

Reactは表示先のdiv、標準の表示は盤と後始末を管理します。初期の設定、保存、見た目は表示時に読むため、別の盤や初期設定を読み込むときはReactのkeyを変えます。コールバックの参照は更新されます。Reactは任意のpeerで、計算部分は読み込みません。

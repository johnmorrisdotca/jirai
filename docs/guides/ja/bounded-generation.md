---
title: 推測不要の盤を上限付きで作る
section: how-to
order: 3
description: シード・開始位置・上限を指定し、検証していない盤を成功として扱いません。
---

## 検証した盤を作る

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

同じ設定と開始位置では、シードが候補の順を固定します。最初にランダムな配置を試し、その後、よい候補の地雷を動かして修正できます。どちらも標準の推論で確認します。`attempt`は採用した候補や修正の段階です。教材を再現するときは、シードに加え、版、近傍、形、大きさ、地雷数、最初のマス、生成の設定をそろえます。

## 失敗をそのまま扱う

`GenerationError`は、不正な設定、安全な開始位置を作れない場合、上限に達した場合を区別します。clearの開始では、守るマスが多すぎて地雷を置けないことがあります。孤立した開始位置からは、推論を進められない場合もあります。検証に失敗して、推測の必要な盤を成功として返すことはありません。`repair:false`や修正回数0では、以前の候補だけの方式になります。厳密な列挙にも、公開したマス数と訪問数の上限があります。

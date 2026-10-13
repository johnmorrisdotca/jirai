---
title: 標準の盤を埋め込んで操作する
section: how-to
order: 8
description: 標準の表示、イベント、属性、後始末を使います。
---

## 表示のハンドルを保つ

```ts no-run
import { mountJirai } from "@johnmorrisdotca/jirai/play";
const host=document.createElement("div");
document.body.append(host);
const board=mountJirai(host,{language:"ja",onChange:game=>console.log(game.status),onError:error=>console.log(error.message)});
board.set({material:"wood",pieces:"flowers"});
console.log(board.game().status,board.progress().length);
board.destroy();
```

`play`、`hint`、`restart`、`load`、`set`、`destroy` は標準の実装を使います。保存はページ側の役割です。信頼するページ側のコールバックは標準の状態を受け取り、フレームの公開メッセージは埋め込みの仕様に従います。origin と source を確認してから使います。

## ビルダーの例をコピーする

近傍、レベルや大きさ、形、シードや日付、安全な開始、推測不要の生成、素材、印、言語、操作を選びます。不正な設定は受け付けません。ビルダーには、版を固定したフレーム、要素、モジュール、フレームワークの例があります。[完全な埋め込みガイド](../../embeds.md)に、属性の別名、日付、イベントを記載しています。Docs は初期言語と切り替えに従い、API のアンカーも残します。

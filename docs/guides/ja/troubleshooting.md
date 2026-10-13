---
title: 困ったとき・よくある質問
section: troubleshooting
order: 9
description: 生成エラー、保存のnull、無効なマス、空の推論を確認します。
---

## 結果の意味を確認する

| 結果 | 意味 |
| --- | --- |
| GenerationError の `settings` | 盤の設定や処理の上限が不正です。 |
| GenerationError の `opening` | 指定した安全な開始位置では、その盤を作れません。 |
| GenerationError の `exhausted` | 候補や修正の上限内で、検証した盤を作れませんでした。 |
| `gameFromProgress` / `decodeOrthogonalGame` が null | 保存や再生、形式の検証に失敗しました。 |
| `levelNamed` が null | 現在の名前や以前の別名に一致しません。 |
| 見える数字が null | 旗があっても、まだ隠れた情報です。 |
| 推論の `reason:none` | 有効な証明の方法で、確実な移動を見つけられませんでした。 |

## 有効なマスと開始位置を確かめる

形のある盤ではマスを除くため、長方形の中の番号でも無効な場合があります。`activeCell` と `activeCells` を使います。端がつながる盤は長方形です。clear の開始は近隣を守るため、地雷を置く場所が足りないことがあります。失敗したときに、説明なく推測不要の設定を切らないでください。復元には、近傍、シード、開始、版付きの記録を保ちます。

## ブラウザーの後始末

要素の読み込みやエラーのイベントを待ち、初期化後に標準の操作を使います。実際の HTMLElement へ表示し、取り除くときは `destroy()` を呼びます。React の初期設定を変えるときは、新しい key を使います。[README の例](../../../README.md#examples)と[埋め込みの詳しい仕様](../../embeds.md)は、そのまま残しています。

# @chroma/server

## Package Overview

@chroma/server (`chromad`) はバックグラウンドで動作するサーバーです。

- OSごとに適切な方法でChromeを起動するロジックを持ちます。
- UNIXドメインソケットでクライアントからのRPCリクエストを待ち受けてChromeを起動します。

ユーザーによってlaunchdやsystemdでデーモン化されて動くことが前提です。

## Commands

- `mise run //packages/server:dev` : 開発中のサーバーを起動します。
- `mise run //packages/server:check -- [files...]` : 型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/server:fix -- [files...]` : フォーマッター・リンターの自動修正を実行します。
- `mise run //packages/server:test -- [vitest-args...]` : テストを実行します。
- `mise run //packages/server:build` : パッケージをビルドします。

## Architecture

クリーンアーキテクチャを参考にしたレイヤー構成を採用していますが、依存性逆転の実現方法が伝統的なクリーンアーキテクチャとは異なります。

伝統的なクリーンアーキテクチャではユースケース層がインターフェースを定義し、インフラストラクチャ層がそれを実装します。
このプロジェクトではEffect-TSの `Context.Tag` がインターフェースの役割を担い、各層が自身の `Context.Tag` を定義します。ユースケースはインフラストラクチャ層の `Context.Tag` に依存し、実装の差し替えはエントリーポイント (`main.ts`) で `Layer` のワイヤリングによって行います。

### Layer Dependency Rule

依存は外側から内側への一方向のみ許可します。

```
presentation → use-case → adapter
                        → infrastructure
```

- `presentation` は `use-case` に依存できるが、その逆は不可。
- `use-case` は `adapter` と `infrastructure` の `Context.Tag` に依存できるが、その逆は不可。
- `adapter` と `infrastructure` は互いに依存しない。
- `main.ts` は全レイヤーに依存し、`Layer` を使って依存関係をワイヤリングする。

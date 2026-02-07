# @chroma/client

## Package Overview

@chroma/client (`chroma`) はユーザーが直接実行するCLIツールです。

- 設定ファイル・環境変数・コマンドライン引数をパースし、起動すべきChromeプロファイルを決定します。
- @chroma/server (`chromad`) にUNIXドメインソケット経由でRPCリクエストを送り、Chromeを起動させます。

`BROWSER` 環境変数経由で他のツールから呼び出されることも想定します。

## Commands

- `mise run //packages/client:client -- [args...]` : 開発中のCLIクライアントを実行します。
- `mise run //packages/client:check -- [files...]` : 型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/client:fix -- [files...]` : フォーマッター・リンターの自動修正を実行します。
- `mise run //packages/client:test -- [vitest-args...]` : テストを実行します。
- `mise run //packages/client:build` : パッケージをビルドします。

## Architecture

クリーンアーキテクチャを採用しています。レイヤー間の依存方向は以下の通りです:

```
presentation → use-case → domain
                        → infrastructure
```

- `presentation` は `use-case` に依存できるが、その逆は不可。
- `use-case` は `domain` と `infrastructure` の `Context.Tag` に依存できるが、その逆は不可。
- `domain` と `infrastructure` は互いに依存しない。
- `main.ts` は全レイヤーに依存し、`Layer` でワイヤリングする。

## Structure

- `src/main.ts` : エントリーポイント。CLI引数解析とLayerワイヤリング。
- `src/presentation/` : ユースケース呼び出しとエラーハンドリング。
- `src/use-case/` : ユースケース。ビジネスロジックのオーケストレーション。
- `src/domain/` : ドメインサービス・ドメインモデル。
- `src/infrastructure/` : 外部システムとのインターフェイス (RPCクライアント)。

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

## Structure

- `src/main.ts` : エントリーポイント。
- `src/services/` : サービスレイヤー。実処理の実装。
- `src/externals/` : 外部システムとのインターフェイス (RPCクライアント)。

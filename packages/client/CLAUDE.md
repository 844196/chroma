# @chroma/client

## パッケージ概要

@chroma/client (`chroma`) はユーザーが直接実行するCLIツールです。

- 設定ファイル・環境変数・コマンドライン引数をパースし、起動すべきChromeプロファイルを決定します（CWDベースの自動解決あり）。
- @chroma/server (`chromad`) にUNIXドメインソケット経由でRPCリクエストを送り、Chromeを起動させます。

`BROWSER` 環境変数経由で他のツールから呼び出されることも想定します。

詳細は [docs/client.md](../../docs/client.md) を参照してください。

## パッケージ固有の技術スタック

- Cliffyを使用してコマンドライン引数をパースします。

## 開発コマンド

- `mise run //packages/client:dev -- [args...]` : 開発中のCLIクライアントを実行します。
- `mise run //packages/client:build` : パッケージをビルドします。

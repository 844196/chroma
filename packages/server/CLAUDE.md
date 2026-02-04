# @chroma/server

## Package Overview

@chroma/server (`chromad`) はバックグラウンドで動作するサーバーです。

- OSごとに適切な方法でChromeを起動するロジックを持ちます。
- UNIXドメインソケットでクライアントからのRPCリクエストを待ち受けてChromeを起動します。

ユーザーによってlaunchdやsystemdでデーモン化されて動くことが前提です。

## Commands

- `mise run :dev` : 開発中のサーバーを起動します。
- `mise run :check -- [files...]` : 型チェック・フォーマッター・リンターを実行します。
- `mise run :fix -- [files...]` : フォーマッター・リンターの自動修正を実行します。
- `mise run :test -- [files...]` : テストを実行します。
- `mise run :build` : パッケージをビルドします。

## Structure

- `src/main.ts` : エントリーポイント。
- `src/app/` : アプリケーションレイヤー。RPCハンドラ実装。
- `src/services/` : サービスレイヤー。

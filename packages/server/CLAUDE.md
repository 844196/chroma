# @chroma/server

## パッケージ概要

@chroma/server (`chromad`) はバックグラウンドで動作するサーバーです。

- OSごとに適切な方法でChromeを起動するロジックを持ちます。
- UNIXドメインソケットでクライアントからのRPCリクエストを待ち受けてChromeを起動します。

ユーザーによってlaunchdやsystemdでデーモン化されて動くことが前提です。デーモン化の設定例は `../../examples/` を参照（launchd / systemd）。

詳細は [docs/server.md](../../docs/server.md) を参照してください。

## 開発コマンド

- `mise run //packages/server:dev` : 開発中のサーバーを起動します。
- `mise run //packages/server:build` : パッケージをビルドします。

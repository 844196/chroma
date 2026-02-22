---
name: e2e-testing
description: クライアントとサーバー間の動作を検証するE2Eワークフロー。コード変更後の動作確認やエラーハンドリングの検証など、実行中のサーバーが必要なテストを行う際に使用する。
---

# E2E Testing

## Step 1: 開発サーバーの起動

バックグラウンドで起動し、出力に `starting server on unix socket` が含まれることを確認する。確認できない場合はエラー内容をユーザーに報告して中断する。

```bash
mise run //packages/server:dev -- --with-rm-socket
```

## Step 2: クライアントの実行

スキル呼び出し時の `$ARGUMENTS` をそのままクライアントに渡す。引数が省略された場合は `--profile "Default" https://example.com` をデフォルトとして使用する。

```bash
mise run //packages/client:dev -- $ARGUMENTS
```

コマンドが非ゼロで終了した場合はエラー内容をユーザーに報告し、Step 4 へスキップする。

## Step 3: サーバーログの確認

バックグラウンドタスクの出力を読み、リクエスト処理に関するログを確認する。確認すべきポイント:

- `RPC succeeded` / `RPC failed` (LoggingMiddleware の出力)
- エラーの有無とその内容

ログの内容をユーザーに報告する。

## Step 4: サーバーの停止

バックグラウンドタスクを停止する。

---
name: e2e-dev
description: 開発サーバーを起動し、クライアントでRPCリクエストを送信し、サーバーログを確認する一連のE2Eワークフロー。「E2Eで確認して」「動作確認して」等の指示で使用します。
---

# E2E Dev Workflow

開発サーバーの起動からクライアント実行・ログ確認・停止までを一連で行う。

## 手順

### 1. 開発サーバーの起動

バックグラウンドで起動し、`starting server on unix socket` のログが出るまで待つ。

```bash
# --with-rm-socket : Claude Code の TaskStop が SIGKILL でプロセスを終了するため、2回目以降の起動に失敗する問題のワークアラウンド
mise run //packages/server:dev -- --with-rm-socket
```

### 2. クライアントの実行

`$ARGUMENTS` をそのままクライアントに渡す。引数が省略された場合は `--profile "Default" https://example.com` をデフォルトとして使用する。

```bash
mise run //packages/client:dev -- $ARGUMENTS
```

### 3. サーバーログの確認

バックグラウンドタスクの出力ファイルを読み、リクエスト処理に関するログを確認する。確認すべきポイント:

- `RPC succeeded` / `RPC failed` (LoggingMiddleware の出力)
- エラーの有無とその内容

ログの内容をユーザーに報告する。

### 4. サーバーの停止

`TaskStop` でバックグラウンドタスクを停止する。SIGKILL で終了するため `gracefully shutting down` のログは出ない。

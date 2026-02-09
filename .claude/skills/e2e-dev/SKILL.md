---
name: e2e-dev
description: 開発サーバーを起動し、クライアントでRPCリクエストを送信し、サーバーログを確認する一連のE2Eワークフロー。「E2Eで確認して」「動作確認して」等の指示で使用します。
---

# E2E Dev Workflow

開発サーバーの起動からクライアント実行・ログ確認・停止までを一連で行う。

## 手順

### 1. ソケット残留の確認と削除

前回の停止で残留したソケットファイルがあれば削除する。ソケットパスは `$CHROMA_RUNTIME_DIR` 環境変数 (mise.toml で `$XDG_RUNTIME_DIR/chroma-dev` に設定される) 配下の `chroma.sock`。

```bash
rm -f /run/user/$(id -u)/chroma-dev/chroma.sock
```

**注意**: この削除は開発環境でのみ行う。ソケット残留は Claude Code の `TaskStop` が SIGKILL でプロセスを終了するために発生する既知の問題であり、`UnixSocket` (`packages/server/src/infrastructure/unix-socket.ts`) のバグではない。

### 2. 開発サーバーの起動

バックグラウンドで起動し、`starting server on unix socket` のログが出るまで待つ。

```bash
mise run //packages/server:dev
```

### 3. クライアントの実行

`$ARGUMENTS` をそのままクライアントに渡す。引数が省略された場合は `--profile "Default" https://example.com` をデフォルトとして使用する。

```bash
mise run //packages/client:dev -- $ARGUMENTS
```

### 4. サーバーログの確認

バックグラウンドタスクの出力ファイルを読み、リクエスト処理に関するログを確認する。確認すべきポイント:

- `RPC succeeded` / `RPC failed` (LoggingMiddleware の出力)
- エラーの有無とその内容

ログの内容をユーザーに報告する。

### 5. サーバーの停止

`TaskStop` でバックグラウンドタスクを停止する。SIGKILL で終了するため `gracefully shutting down` のログは出ない。

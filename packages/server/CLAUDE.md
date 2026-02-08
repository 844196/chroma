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

## Structure

```
src/
  presentation/                # プレゼンテーション層
    chrome-rpc-group.ts        # ChromeRpcGroup ハンドラ実装
    logging-middleware.ts      # ロギングミドルウェア
  application/                 # アプリケーション層
    launch-chrome-use-case.ts  # LaunchChromeUseCase Tag + Layer
  domain/                      # ドメイン層
    profile-name-resolver.ts   # ProfileNameResolver Tag + Layer (DomainService)
    command-factory.ts         # CommandFactory Tag (ポート定義)
    command-executor.ts        # CommandExecutor Tag, CommandFailedError (ポート定義)
  infrastructure/              # インフラストラクチャ層
    command-factory.ts         # CommandFactoryDarwinLive, CommandFactoryWslLive (ポート実装)
    command-executor.ts        # CommandExecutorLive (ポート実装)
    unix-socket.ts             # UnixSocket (ソケット管理)
```

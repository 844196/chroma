# @chroma/server

## パッケージ概要

@chroma/server (`chromad`) はバックグラウンドで動作するサーバーです。

- OSごとに適切な方法でChromeを起動するロジックを持ちます。
- UNIXドメインソケットでクライアントからのRPCリクエストを待ち受けてChromeを起動します。

ユーザーによってlaunchdやsystemdでデーモン化されて動くことが前提です。

## 開発コマンド

- `mise run //packages/server:dev` : 開発中のサーバーを起動します。
- `mise run //packages/server:check -- [files...]` : 型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/server:fix -- [files...]` : フォーマッター・リンターの自動修正を実行します。
- `mise run //packages/server:test -- [vitest-args...]` : テストを実行します。
- `mise run //packages/server:build` : パッケージをビルドします。

## 構成

```
src/
  main.ts                        # エントリーポイント (Layer合成 + サーバー起動)
  presentation/                  # プレゼンテーション層
    chrome-rpc-group.ts          # ChromeRpcGroupLive (RPCハンドラ実装)
    error-masking-middleware.ts  # ErrorMaskingMiddleware Tag + Layer (RPCミドルウェア)
    logging-middleware.ts        # LoggingMiddleware Tag + Layer (RPCミドルウェア)
  application/                   # アプリケーション層
    launch-chrome-use-case.ts    # LaunchChromeUseCase Tag + Layer
  domain/                        # ドメイン層
    app-env.ts                   # AppEnv Tag (ポート定義)
    profile-name-resolver.ts     # ProfileNameResolver Tag + Layer (DomainService)
    command-factory.ts           # CommandFactory Tag (ポート定義)
    command-executor.ts          # CommandExecutor Tag, CommandFailedError (ポート定義)
  infrastructure/                # インフラストラクチャ層
    command-factory.ts           # CommandFactoryDarwinLive, CommandFactoryWslLive (ポート実装)
    command-executor.ts          # CommandExecutorLive (ポート実装)
    unix-socket.ts               # UnixSocket (ソケット管理), AddressAlreadyInUseError
```

## サービス依存関係

```
ChromeRpcGroupLive (presentation)
  └─ LaunchChromeUseCase (application)
      ├─ ProfileNameResolver (domain / DomainService)
      │   └─ Config (@chroma/shared)
      ├─ CommandFactory (domain / ポート)
      │   ├─ CommandFactoryDarwinLive (infrastructure / macOS)
      │   └─ CommandFactoryWslLive (infrastructure / WSL)
      └─ CommandExecutor (domain / ポート)
          └─ CommandExecutorLive (infrastructure)

ErrorMaskingMiddleware (presentation)
  └─ AppEnv (domain / ポート) → process.env.NODE_ENV

LoggingMiddleware (presentation)
  └─ RPCリクエストの成功/失敗をログ出力

HttpServerLive (main.ts)
  ├─ SocketPath (@chroma/shared)
  └─ UnixSocket (infrastructure)
```

## 主要な型シグネチャ

```typescript
// LaunchChromeUseCase — Chrome起動のオーケストレーション
invoke: (profileName: Option.Option<string>, url: Option.Option<string>)
  => Effect.Effect<void, CommandFailedError | InvalidProfileNameError>

// ProfileNameResolver — エイリアス解決 + ProfileNameスキーマバリデーション
resolve: (given: string)
  => Effect.Effect<ProfileName, InvalidProfileNameError>

// CommandFactory — OS固有のChrome起動コマンド構築 (ポート)
create: (profileName: Option.Option<ProfileName>, url: Option.Option<string>)
  => Effect.Effect<Command.Command>

// CommandExecutor — コマンド実行 (ポート)
exec: (cmd: Command.Command)
  => Effect.Effect<void, CommandFailedError>

// ErrorMaskingMiddleware — RPCミドルウェア (最外層)
// production: defect → InternalServerError に変換 (内部情報のマスク)
// development: defect をそのまま伝播

// LoggingMiddleware — RPCミドルウェア (内側)
// 成功時: Effect.logInfo('RPC succeeded') + withLogSpan(rpc.key)
// 失敗時: Effect.logError('RPC failed', cause) + withLogSpan(rpc.key)

// AppEnv — アプリケーション環境 (ポート)
// Context.Tag<AppEnv, 'development' | 'production'>
```

## エラー型

| エラー | モジュール | フィールド |
|--------|-----------|-----------|
| `CommandFailedError` | domain/command-executor.ts | `exitCode: int`, `stdout: string`, `stderr: string` |
| `AddressAlreadyInUseError` | infrastructure/unix-socket.ts | `path: string` |

共通エラー型 (`@chroma/shared`): `ChromeLaunchError`, `InvalidProfileNameError`

## 環境変数

| 変数 | デフォルト | 用途 |
|------|----------|------|
| `CHROMA_LOG_LEVEL` | `Info` | ログレベル設定 (`All`, `Debug`, `Info`, `Warning`, `Error`, `Fatal`, `None`) |
| `NODE_ENV` | `production` | アプリケーション環境 (`development`: defectをそのまま伝播, それ以外: `production`扱いでdefectをマスク) |

ソケットパス・設定ファイルパスの環境変数は `@chroma/shared` を参照。

## 詳細ドキュメント

リクエストライフサイクル・Layer合成・外部コマンド実行・ロギング詳細は [docs/server.md](../../docs/server.md) を参照。

# @chroma/client

## パッケージ概要

@chroma/client (`chroma`) はユーザーが直接実行するCLIツールです。

- 設定ファイル・環境変数・コマンドライン引数をパースし、起動すべきChromeプロファイルを決定します。
  - カレントディレクトリに基づき、設定ファイルの `paths` フィールドからプロファイル名を自動解決します。
- @chroma/server (`chromad`) にUNIXドメインソケット経由でRPCリクエストを送り、Chromeを起動させます。

`BROWSER` 環境変数経由で他のツールから呼び出されることも想定します。

## パッケージ固有の技術スタック

- Cliffyを使用してコマンドライン引数をパースします。

## 開発コマンド

- `mise run //packages/client:dev -- [args...]` : 開発中のCLIクライアントを実行します。
- `mise run //packages/client:check -- [files...]` : 型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/client:fix -- [files...]` : フォーマッター・リンターの自動修正を実行します。
- `mise run //packages/client:test -- [vitest-args...]` : テストを実行します。
- `mise run //packages/client:build` : パッケージをビルドします。

## 構成

```
src/
  main.ts                          # エントリーポイント (CLIパース + Layer合成)
  presentation/                    # プレゼンテーション層
    launch-chrome-command.ts       # LaunchChromeCommand Tag + Layer (CLIエントリ)
  application/                     # アプリケーション層
    launch-chrome-use-case.ts      # LaunchChromeUseCase Tag + Layer
  domain/                          # ドメイン層
    chrome-client.ts               # ChromeClient Tag (ポート定義)
    cwd-profile-resolver.ts        # CwdProfileResolver Tag + Layer (DomainService)
    home-dir.ts                    # HomeDir Tag (ポート定義)
  infrastructure/                  # インフラストラクチャ層
    chrome-client.ts               # ChromeClientLive (RPCクライアント ポート実装)
```

## サービス依存関係

```
LaunchChromeCommand (presentation)
  └─ LaunchChromeUseCase (application)
      ├─ ChromeClient (domain / ポート)
      │   └─ ChromeClientLive (infrastructure)
      │       ├─ FetchHttpClient + Bun fetch ({ unix: socketPath })
      │       ├─ RpcClient.make(ChromeRpcGroup) + RpcSerialization.layerNdjson
      │       └─ SocketPath (@chroma/shared)
      └─ CwdProfileResolver (domain / DomainService)
          ├─ Config (@chroma/shared)
          └─ HomeDir (domain / ポート) → Node.js homedir()
```

## 主要な型シグネチャ

```typescript
// LaunchChromeCommand — CLIエントリーポイント
run: (profile: Option.Option<string>, url: Option.Option<string>, cwd: string)
  => Effect.Effect<void, ChromeLaunchError | InvalidProfileNameError | RpcClientError>

// LaunchChromeUseCase — プロファイル解決 + RPC呼び出し
invoke: (profileName: Option.Option<string>, url: Option.Option<string>, cwd: string)
  => Effect.Effect<void, ChromeLaunchError | InvalidProfileNameError | RpcClientError>

// ChromeClient — RpcClient<Rpcs<typeof ChromeRpcGroup>> (ポート)
// RpcClient.make(ChromeRpcGroup) で生成される型

// CwdProfileResolver — CWDベースのプロファイル自動解決 (DomainService)
resolve: (cwd: string) => Option.Option<string>

// HomeDir — ホームディレクトリパス (ポート)
// Context.Tag<HomeDir, string>
```

## プロファイル解決戦略

優先順位（高い順）:

1. **明示指定**: `--profile` / `CHROMA_PROFILE` で指定された値をそのまま使用
2. **CWDベース解決**: `CwdProfileResolver` が設定ファイルの `paths` を参照し、カレントディレクトリの最長一致でプロファイルを自動解決
3. **サーバーデフォルト**: プロファイル未指定（`Option.none()`）のままサーバーに送信し、サーバー側でデフォルト動作

## CLI引数・環境変数

### CLIオプション

```
chroma [URL] [-p|--profile <PROFILE>] [-c|--config <PATH>] [-H|--host <HOST>]
```

| オプション | 環境変数 | 説明 |
|-----------|---------|------|
| `-p, --profile <PROFILE>` | `CHROMA_PROFILE` | Chromeプロファイル名（エイリアス解決あり） |
| `-c, --config <PATH>` | `CHROMA_CONFIG` | 設定ファイルパス |
| `-H, --host <HOST>` | `CHROMA_HOST` | Unixソケットパス |
| `[URL]` | — | 開くURL（省略可） |

ソケットパス・設定ファイルパスの共通環境変数は `@chroma/shared` を参照。

## 詳細ドキュメント

CLIフロー・プロファイル解決アルゴリズム・RPC接続の詳細は [docs/client.md](../../docs/client.md) を参照。

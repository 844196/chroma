# chroma

## Project Overview

chromaはURLを指定のChromeプロファイルで開くためのツールです。サーバーとCLIクライアントから構成され、UNIXドメインソケットを介して通信します。

### @chroma/server (`chromad`)

バックグラウンドで動作するサーバーです。UNIXドメインソケットでクライアントからのリクエストを待ち受けてChromeを起動します。

ユーザーによってlaunchdやsystemdでデーモン化されて動くことが前提です。

### @chroma/client (`chroma`)

ユーザーが直接実行するCLIツールです。

`BROWSER` 環境変数経由で他のツールから呼び出されることも想定します。

## Tech Stack

- Bunを使用します。
  - ビルド時に `bun build --compile` でシングルバイナリにすることで、実行環境にBunがなくても動くようにします。
- TypeScriptを使用します。
- Effect-TSを使用します。
- コマンドライン引数のパースにはCliffyを使用します。
- リンター・フォーマッターにはBiomeを使用します。
- テストにはVitestを使用します。
- Bun自体のバージョン管理・タスクランナーにはmiseを使用します。
- CI/CDにはGitHub Actionsを使用します。

## Project Structure

Bunのワークスペース機能を使用してモノレポ構成にしています。

```
<project-root>/
├── dist/        # 配布用のビルド成果物
└── packages/
    ├── client/  # CLIクライアント
    └── server/  # サーバー
```

各パッケージの詳細は `packages/<PACKAGE_NAME>/AGENTS.md` を参照してください。

## Development Commands

- `mise run //packages/...:check` : 全パッケージの型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/...:test` : 全パッケージのテストを実行します。

## Architecture Overview

### Communication Flow

```
┌─────────────────────┐                    ┌─────────────────────┐
│      chroma         │                    │      chromad        │
│    (CLI Client)     │                    │      (Server)       │
├─────────────────────┤                    ├─────────────────────┤
│ Cliffy Command      │                    │ BunHttpServer       │
│      ↓              │                    │      ↓              │
│ ChromeService       │  Unix Socket       │ RpcServer (NDJSON)  │
│      ↓              │  /rpc endpoint     │      ↓              │
│ ProfileNameResolver │ ←────────────────→ │ ChromeRpcGroup      │
│      ↓              │                    │      ↓              │
│ ChromeClient        │                    │ ChromeService       │
│ (RpcClient)         │                    │      ↓              │
└─────────────────────┘                    │ Shell → Chrome      │
                                           └─────────────────────┘
```

### Communication Protocol

- トランスポート : HTTP over Unix Socket
- エンドポイント : `/rpc`
- シリアライズ : NDJSON（Newline Delimited JSON）
- RPCフレームワーク : `@effect/rpc`

## Project Conventions

### Naming

- ディレクトリ・ファイル名には kebab-case を使用します。
  - テストファイル名は、テスト対象のファイル名に `.test` を挟んで命名します (例: `example.test.ts`)。
- 型エイリアス・インターフェイス・クラス名には PascalCase を使用します。
- 変数・関数・メソッド名には camelCase を使用します。
- 定数名には ALL_UPPER_SNAKE_CASE を使用します。

### Testing

- Effectのコードのテストには `@effect/vitest` を使用します。

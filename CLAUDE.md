# chroma

## プロジェクト概要

chromaはURLを指定のChromeプロファイルで開くためのツールです。CLIクライアントとサーバーから構成され、UNIXドメインソケットを介して通信します。

miseおよびBunのモノレポ機能を使用してモノレポ構成にしています。

- `packages/client` : CLIクライアントパッケージ (`@chroma/client`)
- `packages/server` : サーバーパッケージ (`@chroma/server`)
- `packages/shared` : 共通パッケージ (`@chroma/shared`)

## 技術スタック

mise / Bun / TypeScript / Effect-TS / Vitest

## 開発コマンド

### パッケージ共通

以下のコマンドは全パッケージで共通です。`<package>` は `client` / `server` / `shared` のいずれかに置き換えてください。

- `mise run //packages/<package>:check -- [files...]` : `<package>` で型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/<package>:fix -- [files...]` : `<package>` でフォーマッター・リンターの自動修正を実行します。
- `mise run //packages/<package>:test -- [vitest-args...]` : `<package>` のテストを実行します。

### 全パッケージのタスクを一括実行する

- `mise run //packages/...:check` : 全パッケージで型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/...:fix` : 全パッケージでフォーマッター・リンターの自動修正を実行します。
- `mise run //packages/...:test` : 全パッケージのテストを実行します。

**注意**: `...` はプレースホルダーではなく、mise tasksのワイルドカード構文としてそのまま入力します。また、全パッケージを対象とする場合は追加の引数を渡すことはできません。

## ドキュメント

- `packages/<package>/CLAUDE.md` — パッケージごとの概要・開発コマンド
- `docs/architecture.md` — レイヤードアーキテクチャ（Presentation → Application → Domain ← Infrastructure）の依存ルール・DIPの実現方法・ディレクトリ構造
- `docs/client.md` — クライアント詳細（CLIフロー、プロファイル解決アルゴリズム、環境変数）
- `docs/server.md` — サーバー詳細（リクエストライフサイクル、外部コマンド実行、プロトコル、環境変数）
- `docs/shared.md` — 共通パッケージ詳細（ソケットパス・設定ファイルパスの解決順序、環境変数）

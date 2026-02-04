# chroma

## Project Overview

chromaはURLを指定のChromeプロファイルで開くためのツールです。CLIクライアントとサーバーから構成され、UNIXドメインソケットを介して通信します。

miseおよびBunのモノレポ機能を使用してモノレポ構成にしています。

- `packages/client` : CLIクライアントパッケージ (`@chroma/client`)
- `packages/server` : サーバーパッケージ (`@chroma/server`)
- `packages/shared` : 共通パッケージ (`@chroma/shared`)

各パッケージの詳細は `packages/<PACKAGE_NAME>/AGENTS.md` に記述されています。

## Tech Stack

- Bunを使用します。
- TypeScriptを使用します。
- Effect-TSを使用します。

## Commands

- `mise run //packages/...:check` : 全パッケージの型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/...:test` : 全パッケージのテストを実行します。

## Project Conventions

### Naming

- ディレクトリ・ファイル名には kebab-case を使用します。
- 型エイリアス・インターフェイス・クラス名には PascalCase を使用します。
- 変数・関数・メソッド名には camelCase を使用します。
- 定数名には ALL_UPPER_SNAKE_CASE を使用します。

### Testing

- テストファイルはテスト対象ファイルと同じディレクトリに `*.test.ts` として配置します。
- Effect-TSのコードのテストには `@effect/vitest` を使用します。

### Guardrails

- コードを変更したら常に `mise run //packages/...:check` と `mise run //packages/...:test` を実行して、問題がないことを確認します。

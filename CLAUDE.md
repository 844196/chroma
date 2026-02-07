# chroma

## Project Overview

chromaはURLを指定のChromeプロファイルで開くためのツールです。CLIクライアントとサーバーから構成され、UNIXドメインソケットを介して通信します。

miseおよびBunのモノレポ機能を使用してモノレポ構成にしています。

- `packages/client` : CLIクライアントパッケージ (`@chroma/client`)
- `packages/server` : サーバーパッケージ (`@chroma/server`)
- `packages/shared` : 共通パッケージ (`@chroma/shared`)

各パッケージの詳細は `packages/<PACKAGE_NAME>/CLAUDE.md` に記述されています。

## Tech Stack

- Bunを使用します。
- TypeScriptを使用します。
- Effect-TSを使用します。

## Commands

### Run All Packages

- `mise run //packages/...:check` : 全パッケージで型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/...:fix` : 全パッケージでフォーマッター・リンターの自動修正を実行します。
- `mise run //packages/...:test` : 全パッケージのテストを実行します。

**注意**: `...` はプレースホルダーではなく、mise tasksのワイルドカード構文としてそのまま入力します。また、全パッケージを対象とする場合は追加の引数を渡すことはできません。

### Run Individual Package

- `mise run //packages/<package>:check -- [files...]` : 型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/<package>:fix -- [files...]` : フォーマッター・リンターの自動修正を実行します。
- `mise run //packages/<package>:test -- [vitest-args...]` : テストを実行します。

## Architecture

各パッケージはレイヤードアーキテクチャを採用し、Effect-TSの `Context.Tag` と `Layer` で依存性逆転を実現します。

### DIPの実現方法

1. **ポート定義**: 依存先の契約を `Context.Tag` として定義する
2. **実装提供**: インフラストラクチャ層がポートに対する `Layer` 実装を提供する
3. **ワイヤリング**: エントリーポイント (`main.ts`) で `Layer` を組み立て、ポートと実装を結合する

ユースケースのコードは `yield*` でポートのTagを参照するため、実装の詳細を知りません。テスト時は `Layer.succeed` でモック実装を注入します。

### Layer Dependency Rule

依存は外側から内側への一方向のみ許可します。

```
presentation → use-case → domain
                              ↑
                        infrastructure (ポートの Layer 実装を提供)
```

- `presentation` は `use-case` に依存できるが、その逆は不可。
- `use-case` は自身が必要とするポート (`Context.Tag`) を定義し、`domain` の Tag にも依存できる。
- `infrastructure` はポートの `Context.Tag` を use-case 層からインポートし、`Layer` 実装を提供する。
- `domain` は純粋なドメインロジック・スキーマを持つ。ドメインサービスの Tag を定義してもよい。
- `main.ts` は全レイヤーに依存し、`Layer` を使って依存関係をワイヤリングする。

## Project Conventions

### Naming

- ディレクトリ・ファイル名には kebab-case を使用します。
- 型エイリアス・インターフェイス・クラス名には PascalCase を使用します。
- 変数・関数・メソッド名には camelCase を使用します。
- 定数名には ALL_UPPER_SNAKE_CASE を使用します。

### Testing

- テストファイルはテスト対象ファイルと同じディレクトリに `*.test.ts` として配置します。
- Effect-TSのコードのテストには `@effect/vitest` を使用します。

### Git Commit

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従ってコミットメッセージを生成します。

#### Format

```
<type>(<scope>)[!]: <subject>

<body>

[footer(s)]
```

**重要**: このプロジェクトではスコープおよび本文を必須とします。

#### Allowed Types

- `feat:` - 新機能の追加
- `fix:` - バグ修正
- `refactor:` - リファクタリング
- `docs:` - ドキュメントの追加・更新
- `style:` - フォーマット修正 (コードの動作に影響しない変更)
- `perf:` - パフォーマンス改善
- `test:` - テストコードの追加・修正
- `chore:` - メンテナンス作業
  - `chore(deps):` - 依存関係の更新

#### Allowed Scopes

- `client`
- `server`
- `shared`
- `deps`

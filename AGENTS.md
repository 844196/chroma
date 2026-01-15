# chroma

## Project Overview

chromaはURLを指定のChromeプロファイルで開くためのツールです。デーモンプロセスとCLIクライアントから構成され、UNIXドメインソケットを介して通信します。

#### `chromad`

バックグラウンドで動作するデーモンプロセスです。UNIXドメインソケットでクライアントからのリクエストを待ち受けてChromeを起動します。

ユーザーによってlaunchdやsystemdでデーモン化されて動くことが前提です。

#### `chroma`

ユーザーが直接実行するCLIツールです。

`BROWSER` 環境変数経由で他のツールから呼び出されることも想定します。

## Tech Stack

- Denoを使用します。
  - ビルド時に `deno compile` でシングルバイナリにすることで、実行環境にDenoがなくても動くようにします。
- TypeScriptを使用します。
- サーバーフレームワークにはHonoを使用します。
- バリデーションにはZodを使用します（詳細は `define-zod-schema` スキルを参照）。
- コマンドライン引数のパースにはCliffyを使用します。
- フォーマッターにはDeno組み込みの `deno fmt` を使用します。
- リンターにはDeno組み込みの `deno lint` を使用します。
- テストにはDeno組み込みの `deno test` を使用します。
- Deno自体のバージョン管理・タスクランナーにはmiseを使用します。
- CI/CDにはGitHub Actionsを使用します。

## Project Structure

[Feature-Sliced Design](https://feature-sliced.design/ja/docs/reference/layers)に基づいてファイルを配置しています。

```
<project-root>/
├── build/                  # ビルド出力ディレクトリ
├── cli/                    # ビルドターゲット
│   ├── chroma.ts           # chroma エントリーポイント
│   └── chromad.ts          # chromad エントリーポイント
└── src/                    # ソースコード
    ├── app/                # アプリケーション層: 初期化・ルーティング
    │   ├── client.ts       # クライアントアプリケーション
    │   └── server.ts       # サーバーアプリケーション
    ├── features/           # 機能層: ビジネス機能
    │   └── chrome/         # Chrome関連機能
    └── shared/             # 共有層: 共通ライブラリ・ユーティリティ
        └── config.ts       # 設定ファイル処理
```

## Development Commands

- `mise run check -- [files...]` : 型チェック・フォーマッター・リンターを実行します。
- `mise run fix -- [files...]` : フォーマッター・リンターの自動修正を実行します。
- `mise run test -- [files...]` : テストを実行します。
- `mise run build` : プロジェクトをビルドし `build/` ディレクトリに出力します。

## Project Conventions

### Naming

- ディレクトリ・ファイル名には kebab-case を使用します。
  - テストファイル名は、テスト対象のファイル名に `.test` を挟んで命名します (例: `example.test.ts`)。
- 型エイリアス・インターフェイス・クラス名には PascalCase を使用します。
- 変数・関数・メソッド名には camelCase を使用します。
- 定数名には ALL_UPPER_SNAKE_CASE を使用します。

### Testing Strategy

- テストには `@std/testing/bdd` を使用してBDDスタイルで記述します。
  - `describe` でテスト対象をグループ化します。
  - `it` で個別のテストケースを記述します。
  - ネストした `describe` を使用して、より詳細な条件やコンテキストを表現します。
- アサーションには `@std/assert` を使用します。
- モックには `@std/testing/mock` を使用します。

[src/app/runtime.test.ts](src/app/runtime.test.ts) のテストコードがBDDスタイルの記述例となっています。

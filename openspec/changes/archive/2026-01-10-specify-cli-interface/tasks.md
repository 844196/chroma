# Tasks: Specify CLI Interface

## Implementation Tasks

このプロポーザルは仕様策定のみであり、実装タスクはありません。

## Validation Tasks

- [x] `cli-chroma` の spec.md を作成
  - [x] コマンド構文を定義
  - [x] 位置引数 `[URL]` の仕様を記述
  - [x] オプション `-p, --profile` の仕様を記述
  - [x] オプション `-H, --host` の仕様を記述
  - [x] 環境変数 `CHROMA_PROFILE` の仕様を記述
  - [x] 環境変数 `CHROMA_HOST` の仕様を記述
  - [x] 優先順位ルールを記述
  - [x] デフォルト値を記述
  - [x] 各 Requirement に Scenario を追加

- [x] `cli-chromad` の spec.md を作成
  - [x] コマンド構文を定義
  - [x] オプション `--config` の仕様を記述
  - [x] オプション `--runtime-dir` の仕様を記述
  - [x] 環境変数 `CHROMA_CONFIG` の仕様を記述
  - [x] 環境変数 `CHROMA_RUNTIME_DIR` の仕様を記述
  - [x] 優先順位ルールを記述
  - [x] デフォルト値を記述
  - [x] 各 Requirement に Scenario を追加

- [x] `openspec validate specify-cli-interface --strict` を実行して検証

## Dependencies

なし。このタスクは独立しています。

## Notes

- README.mdの内容を忠実に反映すること
- 既存の実装 (`src/cli/chroma.ts`) は参照しない

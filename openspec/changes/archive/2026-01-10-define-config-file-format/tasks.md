# Tasks: Define Config File Format

## Implementation Tasks

- [x] `config-file` capability の仕様を作成
  - [x] 設定ファイルのフォーマット(JSON)を定義
  - [x] `aliases` フィールドのスキーマを定義
  - [x] パース失敗時の動作を定義
  - [x] ファイルが存在しない場合の動作を定義
- [x] `cli-chromad` 仕様の更新
  - [x] デフォルト設定ファイルパスを `config.yaml` から `config.json` に変更
  - [x] 設定ファイル読み込み時のエラーハンドリング要件を追加
- [x] `cli-chroma` 仕様の更新
  - [x] エイリアス解決の詳細要件を追加
  - [x] 設定ファイルとの連携を明確化
- [x] `runtime.ts` の更新
  - [x] `DEFAULT_CONFIG_PATH` の拡張子を `.yaml` から `.json` に変更
- [x] ドキュメントの更新
  - [x] README に設定ファイルの例を追加
  - [x] 設定ファイルのスキーマ説明を追加

## Validation Tasks

- [x] `openspec validate define-config-file-format --strict` が成功する
- [x] すべての spec deltas に少なくとも1つの Scenario が存在する
- [x] MODIFIED/REMOVED 要件が既存要件を正しく参照している
- [x] 関連する capability 間の参照が適切に設定されている

## Dependencies

- `config-file` 仕様は `cli-chromad` と `cli-chroma` から参照される
- `runtime.ts` の更新は仕様作成完了後に行う

## Parallelizable Work

- `config-file`, `cli-chromad`, `cli-chroma` の仕様更新は並行して作成可能

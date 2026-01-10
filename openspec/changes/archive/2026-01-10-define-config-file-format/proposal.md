# Proposal: Define Config File Format

## Overview

設定ファイルのフォーマットとスキーマを定義します。現在 `config.yaml` として参照されているファイルの具体的な仕様を明確化し、JSON形式を採用します。

## Background

- 現在のコードでは設定ファイルパスが `config.yaml` として定義されていますが、実際のフォーマット仕様は未定義です
- YAMLは拡張子が `.yaml` と `.yml` の両方があり、パースにもライブラリが必要で複雑です
- 設定ファイルでは主にプロファイルのエイリアスを管理する必要があります

## Motivation

- 設定ファイルの明確な仕様を定義し、実装とドキュメントの基盤を作ります
- よりシンプルで扱いやすいJSON形式を採用します
- エイリアスによるプロファイル名の短縮入力をサポートします

## Why

設定ファイルのフォーマット仕様が未定義のため、実装とテストを進めることができません。YAMLではなくJSONを選択することで、以下の利点があります:

1. **標準ライブラリでのパース**: Deno組み込みの `JSON.parse()` が使用でき、追加の依存関係が不要
2. **拡張子の一意性**: `.json` のみで、`.yaml` vs `.yml` の混乱がない
3. **スキーマバリデーション**: JSON Schema等を使った厳密なバリデーションが容易
4. **編集頻度**: 設定ファイルは初回セットアップ後はほとんど編集しないため、YAMLの可読性上の利点は限定的

エイリアス機能により、ユーザーは `"Profile 2"` のような長いプロファイル名の代わりに `personal` や `p` といった短い名前を使用でき、コマンド入力が効率化されます。

## Proposed Changes

### 設定ファイルフォーマット

- フォーマット: JSON
- ファイル名: `config.json` (`.yaml` から変更)
- 場所: `${XDG_CONFIG_HOME:-$HOME/.config}/chroma/config.json`

### スキーマ

```json
{
  "aliases": {
    "<PROFILE_DIRECTORY_NAME>": ["alias1", "alias2", ...]
  }
}
```

- キー: Chromeのプロファイルディレクトリ名(例: `"Profile 2"`, `"Default"`)
- 値: そのプロファイルに対するエイリアスの配列

### エラーハンドリング

- 設定ファイルが存在しない: デフォルト値(エイリアスなし)で動作
- パース/バリデーション失敗: 無視してデフォルト値で動作
- 重複エイリアス: 未定義動作(保証なし)

## Design Decisions

### なぜJSONか？

1. 標準ライブラリでパース可能(Deno組み込みの `JSON.parse()`)
2. 拡張子が `.json` に統一されている
3. スキーマ定義とバリデーションが容易
4. 設定ファイルは人間が頻繁に編集するものではないため、YAML の可読性上の利点は限定的

### なぜ "Profile → Aliases" の方向か？

```json
{
  "aliases": {
    "Profile 2": ["personal", "p"],
    "Profile 3": ["work", "w"]
  }
}
```

この構造により：
- プロファイル名が重複しない(キーは一意)
- 1つのプロファイルに複数のエイリアスを定義可能
- 逆引き(エイリアス→プロファイル)も実装しやすい

## Impact

### 影響を受けるコンポーネント

- **chromad**: 設定ファイルの読み込みとパース
- **chroma**: エイリアス解決機能
- **runtime.ts**: デフォルト設定ファイルパスの更新

### 破壊的変更

- 設定ファイル名が `config.yaml` から `config.json` に変更
  - まだ実装されていないため、実質的な破壊的変更はなし

## Alternatives Considered

### YAML形式を維持する

- 却下理由: 拡張子の曖昧さ、パーサーライブラリの必要性

### TOML形式を採用する

- 却下理由: ネストした配列の表現が冗長、Denoでの標準サポートがない

### "Alias → Profile" の方向

```json
{
  "aliases": {
    "personal": "Profile 2",
    "work": "Profile 3"
  }
}
```

- 却下理由: 1つのプロファイルに複数のエイリアスを定義する際に冗長

## Success Criteria

- [ ] 設定ファイルのスキーマが明確に定義されている
- [ ] JSON形式で設定ファイルを読み込めることが仕様化されている
- [ ] エラーハンドリングの動作が明確である
- [ ] 既存のCLI仕様との整合性が保たれている

## References

- [cli-chromad spec](/home/m-takeda/.ghq/github.com/844196/chroma/openspec/specs/cli-chromad/spec.md)
- [cli-chroma spec](/home/m-takeda/.ghq/github.com/844196/chroma/openspec/specs/cli-chroma/spec.md)
- [runtime.ts](/home/m-takeda/.ghq/github.com/844196/chroma/src/runtime.ts)

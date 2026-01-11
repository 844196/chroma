# Proposal: Restrict profileAliases Key Format

## Overview

`daemon.json` の `profileAliases` フィールドのキー(Chromeプロファイルディレクトリ名)について、明示的なフォーマット制約を追加します。これにより、予期しないプロファイルディレクトリ名が設定ファイルに混入することを防ぎ、設定の可読性と保守性を向上させます。

## Motivation

現在の `config-file` 仕様では、`profileAliases` のキーを「Chromeプロファイルディレクトリ名」とだけ記述しており、具体的なフォーマットが定義されていません。Chromeのプロファイルディレクトリ名には実際には以下のような規則があります:

- デフォルトプロファイル: `Default`
- 追加プロファイル: `Profile 1`, `Profile 2`, `Profile 3`, ...

フォーマットを明示的に制約することで:
- 設定ファイルに誤ったキーが含まれることを早期に検出できる
- ユーザーが正しいプロファイルディレクトリ名を理解しやすくなる
- 将来的なバリデーション実装の基礎を築く

## Proposed Changes

### Affected Capabilities
- `config-file`: `profileAliases` フィールドのキーフォーマットに制約を追加

### Changes Summary
1. **`config-file` 仕様更新**
   - `Aliases Field Schema` 要件に、キーフォーマットの制約を追加
   - 許可されるキー: `Default` または `/^Profile \d+$/` (例: `Profile 1`, `Profile 2`)
   - 不正なフォーマットのキーが含まれる場合の動作(バリデーションエラー → デフォルト値で動作)を明確化

## Risks and Mitigations

### Risks
- 既存の実装やドキュメントがまだ存在しないため、影響は限定的

### Mitigations
- アーカイブされた変更 `2026-01-11-rename-config-to-daemon-json` によって `profileAliases` が最近導入されたばかりであり、実装前にこの制約を導入することで将来的な混乱を回避できる

## Alternatives Considered

1. **フォーマット制約を設けない**
   - メリット: 柔軟性が高い
   - デメリット: ユーザーが誤った設定を行いやすい、動作が予測しづらい

2. **より緩い制約 (任意の文字列を許可)**
   - メリット: 実装が簡単
   - デメリット: Chrome以外のブラウザや非標準プロファイルへの対応が曖昧になる

## Success Criteria

- [ ] `config-file` 仕様に `profileAliases` キーフォーマット制約が明記される
- [ ] 有効なキーと無効なキーを示す具体的なシナリオが追加される
- [ ] `openspec validate` がエラーなく通過する

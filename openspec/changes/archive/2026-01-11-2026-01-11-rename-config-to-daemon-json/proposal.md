# Proposal: Rename config.json to daemon.json and Refine Configuration Schema

## Change ID
`2026-01-11-rename-config-to-daemon-json`

## Status
Draft

## Background

現在の設定ファイル `config.json` は、デーモン(`chromad`)専用の設定を格納していますが、ファイル名からその用途が明確ではありません。また、環境変数 `CHROMA_CONFIG` による設定ファイルパスの指定がサポートされていますが、これによって設定の解決フローが複雑になっています。さらに、設定フィールド名 `aliases` は、プロファイルエイリアスという用途を十分に表現できていません。

## Motivation

1. **ファイル名の明確化**: `daemon.json` に変更することで、このファイルがデーモン専用の設定であることを明示する
2. **設定解決の簡素化**: 環境変数 `CHROMA_CONFIG` を削除し、設定ファイルの解決ルールをシンプルに保つ(コマンドラインオプション → デフォルトパス)
3. **フィールド名の改善**: `aliases` を `profileAliases` に変更し、プロファイルエイリアスの用途を明確にする

## Scope

この変更は以下のスペックに影響します:

- `config-file`: 設定ファイルのファイル名、パス、およびスキーマの変更
- `cli-chromad`: 環境変数 `CHROMA_CONFIG` の削除、デフォルト設定ファイルパスの変更

## Impact Analysis

### Breaking Changes
- ✅ 既存の `config.json` ファイルは `daemon.json` に名前変更が必要
- ✅ 環境変数 `CHROMA_CONFIG` は削除され、使用できなくなる
- ✅ 設定ファイル内の `aliases` フィールドは `profileAliases` に変更が必要

### Migration Path
ユーザーは以下の手順で移行する必要があります:
1. `${XDG_CONFIG_HOME:-$HOME/.config}/chroma/config.json` を `daemon.json` にリネーム
2. `daemon.json` 内の `aliases` フィールドを `profileAliases` にリネーム
3. 環境変数 `CHROMA_CONFIG` の使用を削除し、必要に応じて `--config` オプションを使用

### Backward Compatibility
この変更には後方互換性がありません。既存のユーザーは設定ファイルの名前変更とスキーマの更新が必要になります。

## Alternatives Considered

1. **`config.json` のまま維持し、エイリアスのみ変更**: ファイル名の明確性が得られない
2. **環境変数を維持する**: 設定解決の複雑さが残り、メンテナンス負担が増加する
3. **両方のファイル名をサポート**: 実装が複雑になり、混乱を招く可能性がある

## Decision

設定ファイル名を `daemon.json` に変更し、環境変数 `CHROMA_CONFIG` を削除し、`aliases` フィールドを `profileAliases` に変更することを推奨します。これにより、設定の意図が明確になり、コードベースの複雑さが軽減されます。

## Open Questions

なし

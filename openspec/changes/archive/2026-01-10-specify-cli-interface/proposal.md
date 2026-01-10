# Proposal: Specify CLI Interface

## Context

chromaプロジェクトには `chroma` と `chromad` という2つのCLIツールがあります。README.mdにはこれらのCLIインターフェースの使用例と仕様が記載されていますが、正式なOpenSpec仕様としては存在していません。

README駆動開発のアプローチに従い、すでにREADME.mdに記載されているCLIインターフェースを元に、正式な仕様を策定します。

## Problem Statement

- `chroma` コマンドの引数、オプション、環境変数の動作が仕様として明文化されていない
- `chromad` コマンドの引数、オプション、環境変数の動作が仕様として明文化されていない
- 実装とドキュメントの不整合を検証する基準がない

## Proposed Solution

README.mdに記載されている内容を元に、以下の2つの capability として仕様を策定します:

1. **cli-chroma**: `chroma` コマンドのCLIインターフェース仕様
2. **cli-chromad**: `chromad` コマンドのCLIインターフェース仕様

各仕様には以下を含めます:

- コマンドライン引数 (positional arguments)
- オプションフラグとその動作
- 環境変数とオプションの優先順位
- デフォルト値の定義

## Scope

### In Scope

- `chroma` コマンドの以下の仕様:
  - 位置引数 `[URL]`
  - オプション `-p, --profile <PROFILE>`
  - オプション `-H, --host <HOST>`
  - 環境変数 `CHROMA_PROFILE`
  - 環境変数 `CHROMA_HOST`
  - オプションと環境変数の優先順位
  - デフォルト値の定義

- `chromad` コマンドの以下の仕様:
  - オプション `--config <PATH>`
  - オプション `--runtime-dir <PATH>`
  - 環境変数 `CHROMA_CONFIG`
  - 環境変数 `CHROMA_RUNTIME_DIR`
  - オプションと環境変数の優先順位
  - デフォルト値の定義

### Out of Scope

- CLIの実装 (この提案はspecのみ)
- エイリアス解決の実装詳細
- Chrome起動の実装詳細
- エラーハンドリングの詳細
- ロギングの仕様
- テストの実装

## Design Considerations

### Configuration File Path Resolution

`chromad` の `--config` オプションと `CHROMA_CONFIG` 環境変数は設定ファイルパスを指定します。デフォルト値は `${XDG_CONFIG_HOME:-$HOME/.config}/chroma/config.yaml` です。

### Runtime Directory Path Resolution

`chroma` と `chromad` の両方で使用されるランタイムディレクトリのパスは、UNIXドメインソケットの配置場所を決定します。

- `chromad` 側のデフォルト: `${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}/chroma-$UID}/chroma`
- `chroma` 側のデフォルト (UNIX socket): `unix://${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}/chroma-$UID}/chroma/chroma.sock`

### Priority Order

オプションと環境変数の優先順位は以下の通りです:

1. コマンドラインオプション (最優先)
2. 環境変数
3. デフォルト値

## Implementation Notes

- 既存の `src/cli/chroma.ts` の実装は無視し、README.mdの仕様のみに基づく
- 仕様策定のみであり、実装は apply ステージで行う

## Open Questions

- なし (README.mdに必要な情報がすべて記載されている)

## Success Criteria

- [ ] `openspec validate specify-cli-interface --strict` が成功する
- [ ] `cli-chroma` と `cli-chromad` の spec.md が ADDED Requirements として完成している
- [ ] 各 Requirement に少なくとも1つの Scenario が含まれている
- [ ] README.mdの内容と仕様が一致している

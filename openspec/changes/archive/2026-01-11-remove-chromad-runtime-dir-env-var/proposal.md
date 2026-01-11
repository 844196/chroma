# Proposal: Remove CHROMA_RUNTIME_DIR Environment Variable from chromad

## Context

現在、`chromad` はランタイムディレクトリのパスを指定する方法として以下の2つをサポートしています:

1. `--runtime-dir` CLI オプション
2. `CHROMA_RUNTIME_DIR` 環境変数

環境変数は `--runtime-dir` オプションが指定されていない場合のフォールバック値として機能します。

## Problem

環境変数による設定は以下の理由で複雑性を増しています:

- 設定方法が複数存在することで、優先順位の理解が必要になる
- systemd/launchd などのデーモン管理システムで環境変数を設定する必要があり、設定ファイルの管理が煩雑になる
- 明示的な CLI オプションのみをサポートする方が、シンプルで予測可能な動作となる

## Proposal

`chromad` から `CHROMA_RUNTIME_DIR` 環境変数のサポートを削除し、`--runtime-dir` CLI オプションのみをサポートします。

### Changes

- CLI インターフェース:
  - `CHROMA_RUNTIME_DIR` 環境変数の定義を削除
  - `--runtime-dir` オプションは引き続きサポート (デフォルト値も変更なし)
- 仕様:
  - `cli-chromad` 仕様から環境変数に関する要件を削除
  - 関連するシナリオも削除

### Affected Specifications

- `cli-chromad`: Runtime Directory Option 要件の更新、CHROMA_RUNTIME_DIR Environment Variable 要件の削除

## Impact

### Breaking Changes

- `CHROMA_RUNTIME_DIR` 環境変数に依存しているユーザーは、`--runtime-dir` オプションを使用するようにデーモン起動スクリプトを変更する必要があります

### Migration Path

デーモン起動スクリプト (systemd unit file, launchd plist など) で以下のような変更が必要です:

**Before:**
```bash
# 環境変数を設定
export CHROMA_RUNTIME_DIR=/custom/runtime
chromad
```

**After:**
```bash
# CLI オプションで明示的に指定
chromad --runtime-dir /custom/runtime
```

### Benefits

- 設定方法が単一化され、ユーザーの認知負荷が軽減される
- CLI インターフェースがよりシンプルで予測可能になる
- デーモン起動スクリプトの設定が明示的になる

## Alternatives Considered

1. **現状維持**: 環境変数とCLIオプションの両方をサポート
   - 却下理由: 複数の設定方法があることで複雑性が増す

2. **環境変数のみをサポート**: `--runtime-dir` オプションを削除
   - 却下理由: CLI オプションの方が明示的で、デーモン起動スクリプトの可読性が高い

## Timeline

- Design Review: 提案承認後
- Implementation: 1日
- Testing: 実装と同時
- Documentation: 実装と同時

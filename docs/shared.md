# 共通パッケージ詳細

共通のレイヤー構成・依存ルール・ディレクトリ構造は [docs/architecture.md](architecture.md) を参照。

## インフラストラクチャ

### ソケットパス解決順序

1. `$CHROMA_RUNTIME_DIR/chroma.sock`
2. `$XDG_RUNTIME_DIR/chroma/chroma.sock`
3. `/tmp/chroma-<uid>/chroma.sock`

### 共通環境変数

| 変数 | デフォルト | 用途 |
|------|----------|------|
| `CHROMA_RUNTIME_DIR` | — | ランタイムディレクトリ（最優先） |
| `XDG_RUNTIME_DIR` | — | XDG標準ランタイムディレクトリ → `$XDG_RUNTIME_DIR/chroma` |
| `XDG_CONFIG_HOME` | `~/.config` | 設定ファイルのベースディレクトリ → `$XDG_CONFIG_HOME/chroma/config.json` |

### 設定ファイルパス解決順序

1. 呼び出し元による明示指定
2. `$XDG_CONFIG_HOME/chroma/config.json`
3. `~/.config/chroma/config.json`

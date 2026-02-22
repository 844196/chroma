# クライアントパッケージ詳細

共通のレイヤー構成・依存ルール・ディレクトリ構造は [docs/architecture.md](architecture.md) を参照。

## CLIフロー

```
$ chroma [URL] [-p PROFILE] [-c CONFIG] [-H HOST]
  │
  ▼
引数パース (環境変数フォールバックあり)
  ▼
Layer合成 → ユースケース実行
  │ プロファイル解決 → RPC呼び出し
  ▼
結果を受け取りプロセス終了
```

## プロファイル解決アルゴリズム

`CwdProfileResolver` は設定ファイルの `paths` フィールドを使い、カレントディレクトリから最長一致でプロファイルを自動解決します。

詳細な解決例は `CwdProfileResolver` の実装とテストコードを参照してください。

## RPCクライアント接続

NDJSON over HTTP over Unix domain socket でサーバーと通信します。プロトコルの詳細は [docs/server.md](server.md#プロトコル詳細) を参照してください。

## 環境変数

### クライアント固有

| 変数 | デフォルト | 用途 |
|------|----------|------|
| `CHROMA_PROFILE` | — | Chromeプロファイル名（`-p` オプションのフォールバック） |
| `CHROMA_CONFIG` | — | 設定ファイルパス（`-c` オプションのフォールバック） |
| `CHROMA_HOST` | — | Unixソケットパス（`-H` オプションのフォールバック） |

共通環境変数（`XDG_CONFIG_HOME`, `CHROMA_RUNTIME_DIR`, `XDG_RUNTIME_DIR`）および設定ファイルパス・ソケットパスの解決順序は [docs/shared.md](shared.md#インフラストラクチャ) を参照。

# サーバーパッケージ詳細

共通のレイヤー構成・依存ルール・ディレクトリ構造は [docs/architecture.md](architecture.md) を参照。

## リクエストライフサイクル

```
クライアント
  │ POST /rpc (NDJSON over Unix domain socket)
  ▼
HTTPサーバー (Unix domain socket)
  ▼
RPCディスパッチ (NDJSON デシリアライズ → ルーティング)
  ▼
ミドルウェア (エラーマスキング・ロギング)
  ▼
ハンドラ → ユースケース実行
  ▼
レスポンス返却
```

## 外部コマンド実行

OS別にChromeの起動方法が異なります。

- **macOS**: `open` コマンド経由。詳細は `CommandFactoryDarwinLive` を参照。
- **WSL**: PowerShell経由で `Start-Process`。詳細は `CommandFactoryWslLive` を参照。
- 非サポートOSでは `Effect.dieMessage` で即時終了。

`CommandExecutorLive` でプロセスを起動し、終了コードで成功/失敗を判定します。

## ロギング

環境変数 `CHROMA_LOG_LEVEL` で制御（詳細は「環境変数」セクションを参照）。

## プロトコル詳細

- **トランスポート**: HTTP over Unix domain socket
- **エンドポイント**: `POST /rpc`
- **シリアライゼーション**: NDJSON (Newline-Delimited JSON)

## 環境変数

### サーバー固有

| 変数 | デフォルト | 用途 |
|------|----------|------|
| `CHROMA_LOG_LEVEL` | `Info` | ログレベル設定 (`All`, `Debug`, `Info`, `Warning`, `Error`, `Fatal`, `None`) |
| `NODE_ENV` | `production` | アプリケーション環境 (`development`: defectをそのまま伝播, それ以外: `production`扱いでdefectをマスク) |

共通環境変数（`CHROMA_RUNTIME_DIR`, `XDG_RUNTIME_DIR`）およびソケットパス解決順序は [docs/shared.md](shared.md#インフラストラクチャ) を参照。

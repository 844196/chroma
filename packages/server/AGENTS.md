# @chroma/server

## Package Structure

```
<package-root>/
├── build/                     # ビルド成果物
└── src/
    ├── app/
    │   ├── rpcs.ts            # RPCグループ定義、ハンドラ実装
    │   └── runtime.ts         # RuntimeDir、SocketPath、UnixSocketリソース管理
    ├── schemas/
    │   └── profile-name.ts    # プロファイル名のバリデーションスキーマ
    ├── services/
    │   └── chrome-service.ts  # Chrome起動ロジック（WSL統合）
    ├── index.ts               # @chroma/client 向けにエクスポートするバレルファイル
    └── main.ts                # エントリーポイント、全レイヤーの合成
```

## Development Commands

- `mise run :dev` : 開発中のサーバーを起動します。
- `mise run :check -- [files...]` : 型チェック・フォーマッター・リンターを実行します。
- `mise run :fix -- [files...]` : フォーマッター・リンターの自動修正を実行します。
- `mise run :test -- [files...]` : テストを実行します。
- `mise run :build` : パッケージをビルドします。

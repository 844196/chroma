# @chroma/client

## Package Structure

```
<package-root>/
├── build/                             # ビルド成果物
└── src/
    ├── externals/
    │   ├── chrome-client.ts           # サーバーへのRPC通信クライアント
    │   └── config.ts                  # 設定ファイル読み込み
    ├── schemas/
    │   └── config.ts                  # 設定ファイルのスキーマ定義
    ├── services/
    │   ├── chrome-service.ts          # CLI→RPC呼び出しの橋渡し
    │   └── profile-name-resolver.ts   # プロファイルエイリアス解決
    └── main.ts                        # エントリーポイント、Cliffy CLIコマンド定義
```

## Development Commands

- `mise run :client -- [args...]` : 開発中のCLIクライアントを実行します
- `mise run :check -- [files...]` : 型チェック・フォーマッター・リンターを実行します。
- `mise run :fix -- [files...]` : フォーマッター・リンターの自動修正を実行します。
- `mise run :build` : パッケージをビルドします。

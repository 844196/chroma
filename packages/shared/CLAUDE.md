# @chroma/shared

## パッケージ概要

@chroma/shared はクライアント・サーバー間で共有される型定義、スキーマ、インフラストラクチャ実装を提供するパッケージです。

- RPCグループ定義
- ドメイン層: Config Tag、ProfileName スキーマ、エラー型
- インフラストラクチャ層: Config Layer 実装、RuntimeDir、SocketPath

## 開発コマンド

- `mise run //packages/shared:check -- [files...]` : 型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/shared:fix -- [files...]` : フォーマッター・リンターの自動修正を実行します。
- `mise run //packages/shared:test -- [vitest-args...]` : テストを実行します。

## 構成

```
src/
  rpc/                              # RPC定義
    index.ts                        # バレル (@chroma/shared/rpc)
    chrome-rpc-group.ts             # ChromeRpcGroup (RPC定義)
  domain/                           # ドメイン層
    index.ts                        # バレル (@chroma/shared/domain)
    chrome-launch-error.ts          # ChromeLaunchError (ドメインエラー型)
    config.ts                       # Config Tag (ポート定義), ConfigSchema
    invalid-profile-name-error.ts   # InvalidProfileNameError (ドメインエラー型)
    profile-name.ts                 # ProfileName スキーマ
  infrastructure/                   # インフラストラクチャ層
    index.ts                        # バレル (@chroma/shared/infrastructure)
    config.ts                       # ConfigLive (ファイル読み込み + デコード)
    runtime-dir.ts                  # RuntimeDir Tag + Layer
    socket-path.ts                  # SocketPath Tag + Layer
```

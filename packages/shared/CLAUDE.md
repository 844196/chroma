# @chroma/shared

## Package Overview

@chroma/shared はクライアント・サーバー間で共有される型定義、スキーマ、インフラストラクチャ実装を提供するパッケージです。

- RPCグループ定義とエラー型
- ドメイン層: Config Tag、ProfileName スキーマ
- インフラストラクチャ層: Config Layer 実装、RuntimeDir、SocketPath

## Commands

- `mise run //packages/shared:check -- [files...]` : 型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/shared:fix -- [files...]` : フォーマッター・リンターの自動修正を実行します。
- `mise run //packages/shared:test -- [vitest-args...]` : テストを実行します。

## Structure

```
src/
  rpc/                       # RPC定義
    chrome-rpc-group.ts      # ChromeRpcGroup (RPC定義)
    chrome-launch-error.ts   # ChromeLaunchError (RPCエラー型)
  domain/                    # ドメイン層
    config.ts                # Config Tag, ConfigSchema
    profile-name.ts          # ProfileName スキーマ
  infrastructure/            # インフラストラクチャ層
    config.ts                # ConfigLive (ファイル読み込み + デコード)
    runtime-dir.ts           # RuntimeDir Tag + Layer
    socket-path.ts           # SocketPath Tag + Layer
```

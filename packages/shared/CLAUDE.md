# @chroma/shared

## パッケージ概要

@chroma/shared はクライアント・サーバー間で共有される型定義、スキーマ、インフラストラクチャ実装を提供するパッケージです。

- RPCグループ定義
- ドメイン層: Config Tag、ProfileName スキーマ、エラー型
- インフラストラクチャ層: Config Layer 実装、RuntimeDir、SocketPath

## 開発コマンド

- `mise run //packages/shared:build` : JSON Schemaを生成します。
- `mise run //packages/shared:check -- [files...]` : 型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/shared:fix -- [files...]` : フォーマッター・リンターの自動修正を実行します。
- `mise run //packages/shared:test -- [vitest-args...]` : テストを実行します。

## 構成

```
scripts/
  generate-config-schema.ts       # config.json JSON Schema生成スクリプト
src/
  rpc/                              # RPC定義
    index.ts                        # バレル (@chroma/shared/rpc)
    chrome-rpc-group.ts             # ChromeRpcGroup (RPC定義)
    internal-server-error.ts        # InternalServerError (RPCエラー型)
  domain/                           # ドメイン層
    index.ts                        # バレル (@chroma/shared/domain)
    chrome-launch-error.ts          # ChromeLaunchError (ドメインエラー型)
    config.ts                       # Config Tag (ポート定義), ConfigSchema
    invalid-profile-name-error.ts   # InvalidProfileNameError (ドメインエラー型)
    profile-name.ts                 # ProfileName スキーマ
  infrastructure/                   # インフラストラクチャ層
    index.ts                        # バレル (@chroma/shared/infrastructure)
    config.ts                       # ConfigLive, ConfigFileReadError, ConfigFileParseError
    runtime-dir.ts                  # RuntimeDir Tag + Layer
    socket-path.ts                  # SocketPath Tag + Layer
```

## 主要なスキーマ・型定義

```typescript
// ProfileName — Chromeプロファイル名のブランド型
// 'Default' | /^Profile [1-9][0-9]*$/ にマッチする文字列
type ProfileName = string & Brand<'ProfileName'>

// ConfigSchema — 設定ファイルの構造
{
  profileAliases: ReadonlyMap<string, ProfileName>  // エイリアス → プロファイル名
  paths: ReadonlyMap<string, string>                // パスプレフィックス → プロファイル名 (最長一致順ソート済み)
}

// Config — 設定ファイル Tag (ポート)
Context.Tag<Config, typeof ConfigSchema.Type>

// ChromeRpcGroup — RPC定義
ChromeRpcGroup.launch: {
  payload: { profileName: Option<NonEmptyString>, url: Option<NonEmptyString> }
  success: void
  error: ChromeLaunchError | InvalidProfileNameError | InternalServerError
}

// RuntimeDir — ランタイムディレクトリパス Tag
Context.Tag<RuntimeDir, string>

// SocketPath — Unixソケットパス Tag
Context.Tag<SocketPath, string>
```

## エラー型

| エラー | モジュール | フィールド |
|--------|-----------|-----------|
| `ChromeLaunchError` | domain/chrome-launch-error.ts | `exitCode: int`, `stdout: string`, `stderr: string` |
| `InvalidProfileNameError` | domain/invalid-profile-name-error.ts | `givenName: string` |
| `InternalServerError` | rpc/internal-server-error.ts | (なし) |
| `ConfigFileReadError` | infrastructure/config.ts | `path: string`, `cause: Defect` |
| `ConfigFileParseError` | infrastructure/config.ts | `cause: ParseResult.ParseError` |

## 環境変数

| 変数 | デフォルト | 用途 |
|------|----------|------|
| `CHROMA_RUNTIME_DIR` | — | ランタイムディレクトリ（最優先） |
| `XDG_RUNTIME_DIR` | — | XDG標準ランタイムディレクトリ → `$XDG_RUNTIME_DIR/chroma` |
| `XDG_CONFIG_HOME` | `~/.config` | 設定ファイルのベースディレクトリ → `$XDG_CONFIG_HOME/chroma/config.json` |

### パス解決順序

**ソケットパス** (`SocketPath`):
1. `$CHROMA_RUNTIME_DIR/chroma.sock`
2. `$XDG_RUNTIME_DIR/chroma/chroma.sock`
3. `/tmp/chroma-<uid>/chroma.sock`

**設定ファイルパス** (`ConfigLive`):
1. 明示指定 (`opts.path`)
2. `$XDG_CONFIG_HOME/chroma/config.json`
3. `~/.config/chroma/config.json`

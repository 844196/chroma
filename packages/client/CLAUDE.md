# @chroma/client

## パッケージ概要

@chroma/client (`chroma`) はユーザーが直接実行するCLIツールです。

- 設定ファイル・環境変数・コマンドライン引数をパースし、起動すべきChromeプロファイルを決定します。
  - カレントディレクトリに基づき、設定ファイルの `paths` フィールドからプロファイル名を自動解決します。
- @chroma/server (`chromad`) にUNIXドメインソケット経由でRPCリクエストを送り、Chromeを起動させます。

`BROWSER` 環境変数経由で他のツールから呼び出されることも想定します。

## パッケージ固有の技術スタック

- Cliffyを使用してコマンドライン引数をパースします。

## 開発コマンド

- `mise run //packages/client:dev -- [args...]` : 開発中のCLIクライアントを実行します。
- `mise run //packages/client:check -- [files...]` : 型チェック・フォーマッター・リンターを実行します。
- `mise run //packages/client:fix -- [files...]` : フォーマッター・リンターの自動修正を実行します。
- `mise run //packages/client:test -- [vitest-args...]` : テストを実行します。
- `mise run //packages/client:build` : パッケージをビルドします。

## 構成

```
src/
  presentation/                  # プレゼンテーション層
    launch-chrome-command.ts     # LaunchChromeCommand Tag + Layer (CLIエントリ)
  application/                   # アプリケーション層
    launch-chrome-use-case.ts    # LaunchChromeUseCase Tag + Layer
  domain/                        # ドメイン層
    chrome-client.ts             # ChromeClient Tag (ポート定義)
    cwd-profile-resolver.ts      # CwdProfileResolver Tag + Layer (DomainService)
    home-dir.ts                  # HomeDir Tag (ポート定義)
  infrastructure/                # インフラストラクチャ層
    chrome-client.ts             # ChromeClientLive (RPCクライアント ポート実装)
```

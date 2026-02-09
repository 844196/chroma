# サーバー詳細アーキテクチャ

## リクエストライフサイクル

```
クライアント
  │ POST /rpc (NDJSON over Unix domain socket)
  ▼
BunHttpServer (Bun HTTP サーバー)
  │ Unix domain socket でリッスン
  ▼
HttpRouter.Default.serve()
  │ パス /rpc にルーティング
  ▼
RpcServer.layer(ChromeRpcGroupWithMiddleware)
  │ NDJSON デシリアライズ → RPC ディスパッチ
  ▼
LoggingMiddleware
  │ Effect.withLogSpan(rpc.key) でスパン開始
  ▼
ChromeRpcGroupLive.launch ハンドラ
  │ 1. リクエストペイロードをDEBUGログ
  │ 2. LaunchChromeUseCase.invoke 呼び出し
  │ 3. CommandFailedError → ChromeLaunchError にマッピング
  ▼
LaunchChromeUseCase.invoke
  │ 1. profileName が Some → ProfileNameResolver.resolve で解決
  │ 2. CommandFactory.create でコマンド構築
  │ 3. CommandExecutor.exec でコマンド実行
  ▼
LoggingMiddleware (戻り)
  │ 成功: logInfo('RPC succeeded')
  │ 失敗: logError('RPC failed', cause)
  ▼
RpcServer
  │ NDJSON シリアライズ → HTTP レスポンス
  ▼
クライアントにレスポンス返却
```

## Layer合成

`main.ts` の `MainLive` が全Layerを結合します。

`MainLive` は以下のローカル定義レイヤーを含みます。

- `LogLevelLive` : ログレベル設定ライブレイヤー
- `RpcServerLive` : RPCサーバーライブレイヤー
- `HttpServerLive` : HTTPサーバーライブレイヤー (Unix domain socket)
- `CommandFactoryLive` : 実行されているOSに応じたコマンドファクトリーライブレイヤー
  - サポートOS: **macOS** (`CommandFactoryDarwinLive`) / **WSL** (`CommandFactoryWslLive`)
  - 非サポートOSでは `Effect.dieMessage('unsupported OS: ...')` で即時終了

詳細は `packages/server/src/main.ts` を参照してください。

### プログラム起動とシャットダウン

`BunRuntime.runMain` で `MainLive` を起動します。

- 起動時: `BUILD_VERSION` と `BUILD_TIME` をアノテーションしてログ出力
- 正常終了 or 割り込み: `logInfo('gracefully shutting down')` → exit(0)
- エラー終了: `logFatal('program ended with an error', cause)` → exit(1)

詳細は `packages/server/src/main.ts` を参照してください。

## 外部コマンド実行

### macOS (Darwin) — `CommandFactoryDarwinLive`

```
open -n -a "Google Chrome" [--args [--profile-directory=<ProfileName>] [<URL>]]
```

- `-n`: 新しいインスタンスで起動
- `--args`: Chrome に引数を渡す (profileName/url がある場合のみ)
- `--profile-directory=Default`: プロファイル指定

### WSL (Windows Subsystem for Linux) — `CommandFactoryWslLive`

```
/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe Start-Process -FilePath chrome [-ArgumentList '<args>']
```

- `-ArgumentList` は profileName/url がある場合のみ
- profileName: `'--profile-directory="<ProfileName>"'`
- url: `'<URL>'`
- 複数引数はカンマ区切り

### コマンド実行の流れ (`CommandExecutorLive`)

1. `@effect/platform` の `PlatformCommandExecutor.start()` で非同期実行
2. stdout/stderr を並行デコード (concurrency: 3)
3. 終了コード 0 → 成功 (void)
4. 終了コード 非0 → `CommandFailedError { exitCode, stdout, stderr }`

## ロギング

環境変数 `CHROMA_LOG_LEVEL` で制御。デフォルトは `INFO` (`LogLevel.Info`)。

## プロトコル詳細

- **トランスポート**: HTTP over Unix domain socket
- **エンドポイント**: `POST /rpc`
- **シリアライゼーション**: NDJSON (Newline-Delimited JSON)
- **フレームワーク**: `@effect/rpc` の RpcServer + RpcSerialization
- **HTTPサーバー**: `@effect/platform-bun` の BunHttpServer

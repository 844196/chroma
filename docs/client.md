# クライアント詳細アーキテクチャ

## CLIフロー

```
$ chroma [URL] [-p PROFILE] [-c CONFIG] [-H HOST]
  │
  ▼
Cliffy コマンドパース (main.ts)
  │ 環境変数フォールバック: CHROMA_PROFILE, CHROMA_CONFIG, CHROMA_HOST
  │
  ▼
Layer 合成
  │ LaunchChromeCommand.layer
  │   ← LaunchChromeUseCase.layer
  │   ← CwdProfileResolver.layer
  │   ← HomeDir (homedir())
  │   ← ConfigLive({ path: parsedOpts.config })
  │   ← ChromeClientLive({ socketPath: parsedOpts.host })
  │   ← BunContext.layer
  │
  ▼
LaunchChromeCommand.run(profile, url, cwd)
  │
  ▼
LaunchChromeUseCase.invoke(profileName, url, cwd)
  │ 1. profileName が None → CwdProfileResolver.resolve(cwd) で自動解決
  │ 2. Option.orElse で結合
  │ 3. ChromeClient.launch({ profileName, url }) を RPC 呼び出し
  │
  ▼
ChromeClient (RPC)
  │ NDJSON + HTTP + Unix socket → サーバー
  │
  ▼
結果を受け取りプロセス終了
```

## プロファイル解決アルゴリズム

`CwdProfileResolver` は設定ファイルの `paths` フィールドを使い、カレントディレクトリから最長一致でプロファイルを自動解決します。

### 解決例

設定ファイル:
```json
{
  "paths": {
    "~/work": "work-profile",
    "~/work/special": "special-profile"
  }
}
```

展開・ソート後:
```
['/home/user/work/special/', 'special-profile']   // 長さ優先
['/home/user/work/', 'work-profile']
```

| CWD | 結果 |
|-----|------|
| `/home/user/work/special/project` | `Some('special-profile')` |
| `/home/user/work/other` | `Some('work-profile')` |
| `/home/user/docs` | `None()` |

詳細は実装とテストコードを参照してください。

## RPCクライアント接続

### 通信スタック

```
RpcClient.make(ChromeRpcGroup)
  │ RPC メッセージ構築
  ▼
RpcSerialization.layerNdjson
  │ NDJSON エンコード/デコード
  ▼
RpcClient.layerProtocolHttp({ url: 'http://unused/rpc' })
  │ HTTP プロトコルアダプタ
  ▼
FetchHttpClient + Bun fetch
  │ { unix: socketPath } オプションで Unix socket に接続
  ▼
Unix domain socket
  │
  ▼
@chroma/server (chromad)
```

### 接続構築 (`ChromeClientLive`)

`ChromeClientLive` は以下の手順で RPC クライアントを構築します。

1. ソケットパス解決（引数 or 環境変数からの自動解決）
2. Bun fetch に Unix socket サポートを追加（`{ unix: socketPath }` オプション）
3. RPC クライアントの Layer 合成

注意点:
- HTTP プロトコルアダプタが URL を要求するため `http://unused/rpc` を指定するが、実際の接続先は Bun fetch の `{ unix: socketPath }` で Unix socket にリダイレクトされる
- Bun 固有の機能であり、Node.js では別途 `http.Agent` が必要

詳細は実装コードを参照してください。

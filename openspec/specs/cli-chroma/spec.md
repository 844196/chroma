# cli-chroma Specification

## Purpose
TBD - created by archiving change specify-cli-interface. Update Purpose after archive.
## Requirements
### Requirement: Command Syntax

`chroma` コマンドは以下の構文で実行されなければならない (SHALL):

```
chroma [options] [URL]
```

#### Scenario: コマンドをURLのみで実行

**Given** デーモンが起動している  
**When** ユーザーが `chroma http://localhost:5173` を実行  
**Then** デフォルトプロファイルで指定されたURLが開かれる

#### Scenario: コマンドをオプション付きで実行

**Given** デーモンが起動している  
**When** ユーザーが `chroma -p personal http://localhost:5173` を実行  
**Then** personalプロファイルで指定されたURLが開かれる

---

### Requirement: URL Positional Argument

`chroma` コマンドは、オプショナルな位置引数として `[URL]` を受け取らなければならない (SHALL)。

- `[URL]`: Chromeブラウザで開くURLを指定します
- この引数は省略可能です

#### Scenario: URLを指定してコマンドを実行

**Given** デーモンが起動している  
**When** ユーザーが `chroma https://github.com` を実行  
**Then** 指定されたURLがChromeで開かれる

#### Scenario: URLを指定せずにコマンドを実行

**Given** デーモンが起動している  
**When** ユーザーが `chroma` を実行  
**Then** URLなしでChromeが起動される (新しいタブまたはウィンドウ)

---

### Requirement: Profile Option

`-p, --profile <PROFILE>` オプションは、使用するChromeプロファイルを指定しなければならない (SHALL)。

- 指定された値が設定ファイルで定義されたエイリアスの場合、対応するプロファイルディレクトリ名に解決されなければならない (SHALL)
- エイリアスでない場合、値はそのままプロファイルディレクトリ名として扱われなければならない (SHALL)

#### Scenario: エイリアスを使用してプロファイルを指定

**Given** 設定ファイルに `aliases.personal: 'Profile 2'` が定義されている  
**When** ユーザーが `chroma -p personal http://localhost:5173` を実行  
**Then** `Profile 2` プロファイルで指定されたURLが開かれる

#### Scenario: プロファイルディレクトリ名を直接指定

**Given** デーモンが起動している  
**When** ユーザーが `chroma --profile "Profile 4" http://localhost:5173` を実行  
**Then** `Profile 4` プロファイルで指定されたURLが開かれる

#### Scenario: プロファイルオプションを指定しない

**Given** デーモンが起動している  
**And** `CHROMA_PROFILE` 環境変数が設定されていない  
**When** ユーザーが `chroma http://localhost:5173` を実行  
**Then** デフォルトプロファイルで指定されたURLが開かれる

---

### Requirement: Host Option

`-H, --host <HOST>` オプションは、接続するデーモンソケットを指定しなければならない (SHALL)。

- デフォルト値: `unix://${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}/chroma-$UID}/chroma/chroma.sock`

#### Scenario: カスタムソケットパスを指定

**Given** デーモンが `/custom/path/chroma.sock` で起動している  
**When** ユーザーが `chroma -H unix:///custom/path/chroma.sock http://localhost:5173` を実行  
**Then** 指定されたソケット経由でデーモンに接続される

#### Scenario: デフォルトソケットパスを使用

**Given** デーモンがデフォルトパスで起動している  
**And** `CHROMA_HOST` 環境変数が設定されていない  
**When** ユーザーが `chroma http://localhost:5173` を実行  
**Then** デフォルトソケットパス経由でデーモンに接続される

---

### Requirement: CHROMA_PROFILE Environment Variable

`CHROMA_PROFILE` 環境変数は、使用するChromeプロファイルを指定しなければならない (SHALL)。

- `-p/--profile` オプションが指定されていない場合、この環境変数の値が使用されなければならない (SHALL)
- この環境変数が設定されている場合、その値がプロファイル指定として使用されなければならない (SHALL)

#### Scenario: 環境変数でプロファイルを指定

**Given** `CHROMA_PROFILE=project-a` が設定されている  
**And** 設定ファイルに `aliases.project-a: 'Profile 3'` が定義されている  
**When** ユーザーが `chroma http://localhost:5173` を実行  
**Then** `Profile 3` プロファイルで指定されたURLが開かれる

#### Scenario: オプションが環境変数より優先される

**Given** `CHROMA_PROFILE=project-a` が設定されている  
**When** ユーザーが `chroma -p personal http://localhost:5173` を実行  
**Then** `-p` オプションで指定された `personal` プロファイルが使用される

---

### Requirement: CHROMA_HOST Environment Variable

`CHROMA_HOST` 環境変数は、接続するデーモンソケットを指定しなければならない (SHALL)。

- `-H/--host` オプションが指定されていない場合、この環境変数の値が使用されなければならない (SHALL)
- この環境変数が設定されている場合、その値がソケットパスとして使用されなければならない (SHALL)

#### Scenario: 環境変数でソケットパスを指定

**Given** `CHROMA_HOST=unix:///tmp/chroma/chroma.sock` が設定されている  
**When** ユーザーが `chroma http://localhost:5173` を実行  
**Then** 指定されたソケットパス経由でデーモンに接続される

#### Scenario: オプションが環境変数より優先される

**Given** `CHROMA_HOST=unix:///tmp/chroma/chroma.sock` が設定されている  
**When** ユーザーが `chroma -H unix:///custom/chroma.sock http://localhost:5173` を実行  
**Then** `-H` オプションで指定されたソケットパスが使用される

---

### Requirement: Configuration Priority

オプションと環境変数の優先順位は以下の通りでなければならない (SHALL):

1. コマンドラインオプション (最優先)
2. 環境変数
3. デフォルト値

#### Scenario: すべての設定ソースが存在する場合

**Given** `CHROMA_PROFILE=default` が設定されている  
**And** `CHROMA_HOST=unix:///tmp/default.sock` が設定されている  
**When** ユーザーが `chroma -p custom -H unix:///custom.sock http://localhost:5173` を実行  
**Then** コマンドラインオプションで指定された `custom` プロファイルと `unix:///custom.sock` が使用される

#### Scenario: 一部の設定のみコマンドラインで指定

**Given** `CHROMA_PROFILE=env-profile` が設定されている  
**And** `CHROMA_HOST=unix:///env.sock` が設定されている  
**When** ユーザーが `chroma -p cli-profile http://localhost:5173` を実行  
**Then** プロファイルは `cli-profile` が使用され、ホストは環境変数の `unix:///env.sock` が使用される

---

### Requirement: Default Values

設定が指定されていない場合、以下のデフォルト値が使用されなければならない (SHALL):

- Profile: デフォルトプロファイル (プロファイル指定なし)
- Host: `unix://${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}/chroma-$UID}/chroma/chroma.sock`

#### Scenario: すべてデフォルト値を使用

**Given** `CHROMA_PROFILE` 環境変数が設定されていない  
**And** `CHROMA_HOST` 環境変数が設定されていない  
**When** ユーザーが `chroma http://localhost:5173` を実行  
**Then** デフォルトプロファイルとデフォルトソケットパスが使用される

#### Scenario: XDG_RUNTIME_DIRが設定されている場合のデフォルトパス

**Given** `XDG_RUNTIME_DIR=/run/user/1000` が設定されている  
**And** `CHROMA_HOST` 環境変数が設定されていない  
**When** ユーザーが `chroma http://localhost:5173` を実行  
**Then** `unix:///run/user/1000/chroma/chroma.sock` が使用される

#### Scenario: XDG_RUNTIME_DIRが設定されていない場合のデフォルトパス

**Given** `XDG_RUNTIME_DIR` が設定されていない  
**And** `TMPDIR=/tmp` が設定されている  
**And** ユーザーのUIDが `1000`  
**And** `CHROMA_HOST` 環境変数が設定されていない  
**When** ユーザーが `chroma http://localhost:5173` を実行  
**Then** `unix:///tmp/chroma-1000/chroma/chroma.sock` が使用される


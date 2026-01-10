# cli-chromad Specification

## Purpose
TBD - created by archiving change specify-cli-interface. Update Purpose after archive.
## Requirements
### Requirement: Command Syntax

`chromad` コマンドは以下の構文で実行されなければならない (SHALL):

```
chromad [options]
```

#### Scenario: コマンドをオプションなしで実行

**Given** 設定ファイルがデフォルトパスに存在する  
**When** ユーザーが `chromad` を実行  
**Then** デフォルト設定でデーモンが起動する

#### Scenario: コマンドをオプション付きで実行

**Given** カスタム設定ファイルが `/custom/config.yaml` に存在する  
**When** ユーザーが `chromad --config /custom/config.yaml` を実行  
**Then** 指定された設定ファイルでデーモンが起動する

---

### Requirement: Config Option

`--config <PATH>` オプションは、設定ファイルのパスを指定しなければならない (SHALL)。

- デフォルト値: `${XDG_CONFIG_HOME:-$HOME/.config}/chroma/config.json`
- 設定ファイルが存在しない場合、エラーを発生させずにデフォルト設定で動作しなければならない (SHALL)
- 設定ファイルのパースやバリデーションに失敗した場合、エラーを無視してデフォルト設定で動作しなければならない (SHALL)

#### Scenario: カスタム設定ファイルパスを指定

**Given** 設定ファイルが `/etc/chroma/config.json` に存在する  
**When** ユーザーが `chromad --config /etc/chroma/config.json` を実行  
**Then** 指定された設定ファイルが読み込まれる

#### Scenario: デフォルト設定ファイルパスを使用

**Given** `CHROMA_CONFIG` 環境変数が設定されていない  
**And** `XDG_CONFIG_HOME=/home/user/.config` が設定されている  
**When** ユーザーが `chromad` を実行  
**Then** `/home/user/.config/chroma/config.json` が読み込まれる

#### Scenario: XDG_CONFIG_HOMEが設定されていない場合

**Given** `CHROMA_CONFIG` 環境変数が設定されていない  
**And** `XDG_CONFIG_HOME` が設定されていない  
**And** `HOME=/home/user` が設定されている  
**When** ユーザーが `chromad` を実行  
**Then** `/home/user/.config/chroma/config.json` が読み込まれる

#### Scenario: 設定ファイルが存在しない場合

**Given** デフォルトパスに設定ファイルが存在しない  
**When** ユーザーが `chromad` を実行  
**Then** デーモンは正常に起動する  
**And** デフォルト設定(空のエイリアステーブル)で動作する

#### Scenario: 設定ファイルのパースに失敗した場合

**Given** 設定ファイル `/home/user/.config/chroma/config.json` が不正なJSONを含む  
**When** ユーザーが `chromad` を実行  
**Then** デーモンは正常に起動する  
**And** デフォルト設定(空のエイリアステーブル)で動作する  
**And** エラーがログに記録される

### Requirement: Runtime Directory Option

`--runtime-dir <PATH>` オプションは、ランタイムディレクトリのパスを指定しなければならない (SHALL)。

- デフォルト値: `${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}/chroma-$UID}/chroma`
- このディレクトリには UNIXドメインソケット (`chroma.sock`) が作成されなければならない (SHALL)

#### Scenario: カスタムランタイムディレクトリを指定

**Given** `/var/run/chroma` ディレクトリが存在する  
**When** ユーザーが `chromad --runtime-dir /var/run/chroma` を実行  
**Then** `/var/run/chroma/chroma.sock` にソケットが作成される

#### Scenario: デフォルトランタイムディレクトリを使用

**Given** `CHROMA_RUNTIME_DIR` 環境変数が設定されていない  
**And** `XDG_RUNTIME_DIR=/run/user/1000` が設定されている  
**When** ユーザーが `chromad` を実行  
**Then** `/run/user/1000/chroma/chroma.sock` にソケットが作成される

#### Scenario: XDG_RUNTIME_DIRが設定されていない場合

**Given** `CHROMA_RUNTIME_DIR` 環境変数が設定されていない  
**And** `XDG_RUNTIME_DIR` が設定されていない  
**And** `TMPDIR=/tmp` が設定されている  
**And** ユーザーのUID が `1000`  
**When** ユーザーが `chromad` を実行  
**Then** `/tmp/chroma-1000/chroma/chroma.sock` にソケットが作成される

---

### Requirement: CHROMA_CONFIG Environment Variable

`CHROMA_CONFIG` 環境変数は、設定ファイルのパスを指定しなければならない (SHALL)。

- `--config` オプションが指定されていない場合、この環境変数の値が使用されなければならない (SHALL)
- この環境変数が設定されている場合、その値が設定ファイルパスとして使用されなければならない (SHALL)

#### Scenario: 環境変数で設定ファイルパスを指定

**Given** `CHROMA_CONFIG=/opt/chroma/config.yaml` が設定されている  
**When** ユーザーが `chromad` を実行  
**Then** `/opt/chroma/config.yaml` が読み込まれる

#### Scenario: オプションが環境変数より優先される

**Given** `CHROMA_CONFIG=/opt/chroma/config.yaml` が設定されている  
**When** ユーザーが `chromad --config /etc/chroma/config.yaml` を実行  
**Then** `--config` オプションで指定された `/etc/chroma/config.yaml` が使用される

---

### Requirement: CHROMA_RUNTIME_DIR Environment Variable

`CHROMA_RUNTIME_DIR` 環境変数は、ランタイムディレクトリのパスを指定しなければならない (SHALL)。

- `--runtime-dir` オプションが指定されていない場合、この環境変数の値が使用されなければならない (SHALL)
- この環境変数が設定されている場合、その値がランタイムディレクトリパスとして使用されなければならない (SHALL)

#### Scenario: 環境変数でランタイムディレクトリを指定

**Given** `CHROMA_RUNTIME_DIR=/var/run/chroma` が設定されている  
**When** ユーザーが `chromad` を実行  
**Then** `/var/run/chroma/chroma.sock` にソケットが作成される

#### Scenario: オプションが環境変数より優先される

**Given** `CHROMA_RUNTIME_DIR=/var/run/chroma` が設定されている  
**When** ユーザーが `chromad --runtime-dir /tmp/chroma` を実行  
**Then** `--runtime-dir` オプションで指定された `/tmp/chroma/chroma.sock` が使用される

---

### Requirement: Configuration Priority

オプションと環境変数の優先順位は以下の通りでなければならない (SHALL):

1. コマンドラインオプション (最優先)
2. 環境変数
3. デフォルト値

#### Scenario: すべての設定ソースが存在する場合

**Given** `CHROMA_CONFIG=/env/config.yaml` が設定されている  
**And** `CHROMA_RUNTIME_DIR=/env/runtime` が設定されている  
**When** ユーザーが `chromad --config /cli/config.yaml --runtime-dir /cli/runtime` を実行  
**Then** コマンドラインオプションで指定された `/cli/config.yaml` と `/cli/runtime` が使用される

#### Scenario: 一部の設定のみコマンドラインで指定

**Given** `CHROMA_CONFIG=/env/config.yaml` が設定されている  
**And** `CHROMA_RUNTIME_DIR=/env/runtime` が設定されている  
**When** ユーザーが `chromad --config /cli/config.yaml` を実行  
**Then** 設定ファイルは `/cli/config.yaml` が使用され、ランタイムディレクトリは環境変数の `/env/runtime` が使用される

---

### Requirement: Default Values

設定が指定されていない場合、以下のデフォルト値が使用されなければならない (SHALL):

- Config: `${XDG_CONFIG_HOME:-$HOME/.config}/chroma/config.json`
- Runtime Directory: `${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}/chroma-$UID}/chroma`

#### Scenario: すべてデフォルト値を使用

**Given** `CHROMA_CONFIG` 環境変数が設定されていない  
**And** `CHROMA_RUNTIME_DIR` 環境変数が設定されていない  
**And** `XDG_CONFIG_HOME=/home/user/.config` が設定されている  
**And** `XDG_RUNTIME_DIR=/run/user/1000` が設定されている  
**When** ユーザーが `chromad` を実行  
**Then** `/home/user/.config/chroma/config.json` と `/run/user/1000/chroma/chroma.sock` が使用される

#### Scenario: XDG変数がすべて未設定の場合

**Given** すべての環境変数とオプションが未設定  
**And** `HOME=/home/user` が設定されている  
**And** `TMPDIR=/tmp` が設定されている  
**And** ユーザーのUID が `1000`  
**When** ユーザーが `chromad` を実行  
**Then** `/home/user/.config/chroma/config.json` と `/tmp/chroma-1000/chroma/chroma.sock` が使用される

### Requirement: Configuration File Loading

chromad は起動時に設定ファイルを読み込まなければならない (SHALL)。

- 設定ファイルは `config-file` 仕様に従って読み込まれなければならない (SHALL)
- 設定ファイルからエイリアステーブルが構築されなければならない (SHALL)
- エイリアステーブルは chroma クライアントからのエイリアス解決リクエストに使用されなければならない (SHALL)

関連仕様: [`config-file`](../config-file/spec.md)

#### Scenario: 設定ファイルからエイリアステーブルを構築する

**Given** 設定ファイル `config.json` が以下の内容である:
```json
{
  "aliases": {
    "Profile 2": ["personal", "p"],
    "Profile 3": ["work", "w"]
  }
}
```
**When** chromad が起動する  
**Then** エイリアステーブルに `personal` → `Profile 2`, `p` → `Profile 2`, `work` → `Profile 3`, `w` → `Profile 3` のマッピングが作成される

#### Scenario: 設定ファイルが存在しない場合は空のエイリアステーブルを使用

**Given** 設定ファイルが存在しない  
**When** chromad が起動する  
**Then** 空のエイリアステーブルが作成される  
**And** すべてのプロファイル指定は入力値がそのまま使用される


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

- デフォルト値: `${XDG_CONFIG_HOME:-$HOME/.config}/chroma/daemon.json`
- 設定ファイルが存在しない場合、エラーを発生させずにデフォルト設定で動作しなければならない (SHALL)
- 設定ファイルのパースやバリデーションに失敗した場合、エラーを無視してデフォルト設定で動作しなければならない (SHALL)

#### Scenario: カスタム設定ファイルパスを指定

**Given** 設定ファイルが `/etc/chroma/daemon.json` に存在する  
**When** ユーザーが `chromad --config /etc/chroma/daemon.json` を実行  
**Then** 指定された設定ファイルが読み込まれる

#### Scenario: デフォルト設定ファイルパスを使用

**Given** `XDG_CONFIG_HOME=/home/user/.config` が設定されている  
**When** ユーザーが `chromad` を実行  
**Then** `/home/user/.config/chroma/daemon.json` が読み込まれる

#### Scenario: XDG_CONFIG_HOMEが設定されていない場合

**Given** `XDG_CONFIG_HOME` が設定されていない  
**And** `HOME=/home/user` が設定されている  
**When** ユーザーが `chromad` を実行  
**Then** `/home/user/.config/chroma/daemon.json` が読み込まれる

#### Scenario: 設定ファイルが存在しない場合

**Given** デフォルトパスに設定ファイルが存在しない  
**When** ユーザーが `chromad` を実行  
**Then** デーモンは正常に起動する  
**And** デフォルト設定(空のエイリアステーブル)で動作する

#### Scenario: 設定ファイルのパースに失敗した場合

**Given** 設定ファイル `/home/user/.config/chroma/daemon.json` が不正なJSONを含む  
**When** ユーザーが `chromad` を実行  
**Then** デーモンは正常に起動する  
**And** デフォルト設定(空のエイリアステーブル)で動作する  
**And** エラーがログに記録される

---

### Requirement: Runtime Directory Option

`--runtime-dir <PATH>` オプションは、ランタイムディレクトリのパスを指定しなければならない (SHALL)。

- デフォルト値: `${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}/chroma-$UID}/chroma`
- このディレクトリには UNIXドメインソケット (`chroma.sock`) が作成されなければならない (SHALL)

#### Scenario: カスタムランタイムディレクトリを指定

**Given** `/var/run/chroma` ディレクトリが存在する  
**When** ユーザーが `chromad --runtime-dir /var/run/chroma` を実行  
**Then** `/var/run/chroma/chroma.sock` にソケットが作成される

#### Scenario: デフォルトランタイムディレクトリを使用

**Given** `XDG_RUNTIME_DIR=/run/user/1000` が設定されている  
**When** ユーザーが `chromad` を実行  
**Then** `/run/user/1000/chroma/chroma.sock` にソケットが作成される

#### Scenario: XDG_RUNTIME_DIRが設定されていない場合

**Given** `XDG_RUNTIME_DIR` が設定されていない  
**And** `TMPDIR=/tmp` が設定されている  
**And** ユーザーのUID が `1000`  
**When** ユーザーが `chromad` を実行  
**Then** `/tmp/chroma-1000/chroma/chroma.sock` にソケットが作成される

### Requirement: Configuration File Loading

chromad は起動時に設定ファイルを読み込まなければならない (SHALL)。

- 設定ファイルは `config-file` 仕様に従って読み込まれなければならない (SHALL)
- 設定ファイルからエイリアステーブルが構築されなければならない (SHALL)
- エイリアステーブルは chroma クライアントからのエイリアス解決リクエストに使用されなければならない (SHALL)

関連仕様: [`config-file`](../config-file/spec.md)

#### Scenario: 設定ファイルからエイリアステーブルを構築する

**Given** 設定ファイルに `{"profileAliases": {"Profile 2": ["personal", "p"], "Profile 3": ["work", "w"]}}` が定義されている  
**When** chromad が起動する  
**Then** エイリアステーブルに personal → Profile 2, p → Profile 2, work → Profile 3, w → Profile 3 のマッピングが作成される

#### Scenario: 設定ファイルが存在しない場合は空のエイリアステーブルを使用

**Given** 設定ファイルが存在しない  
**When** chromad が起動する  
**Then** 空のエイリアステーブルが作成される  
**And** すべてのプロファイル指定は入力値がそのまま使用される

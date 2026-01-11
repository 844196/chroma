# cli-chromad Specification Delta

この変更は `cli-chromad` 仕様に以下の修正を適用します。

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: CHROMA_CONFIG Environment Variable

この要件は削除されます。`CHROMA_CONFIG` 環境変数のサポートは廃止され、設定ファイルパスは以下のいずれかの方法でのみ指定できます:

1. `--config` コマンドラインオプション
2. デフォルトパス: `${XDG_CONFIG_HOME:-$HOME/.config}/chroma/daemon.json`

以下のシナリオは削除されます:
- ~~環境変数で設定ファイルパスを指定~~
- ~~オプションが環境変数より優先される~~

---

### Requirement: Configuration Priority

オプションと環境変数の優先順位は以下のように簡素化されます (SHALL):

1. コマンドラインオプション (最優先)
2. デフォルト値

環境変数 `CHROMA_CONFIG` は削除されるため、以下の優先順位は適用されません:
- ~~環境変数~~

#### Scenario: コマンドラインオプションでパスを指定

**Given** デフォルトパスに設定ファイルが存在する  
**When** ユーザーが `chromad --config /cli/daemon.json` を実行  
**Then** コマンドラインオプションで指定された `/cli/daemon.json` が使用される

#### Scenario: デフォルト値を使用

**Given** `--config` オプションが指定されていない  
**And** `XDG_CONFIG_HOME=/home/user/.config` が設定されている  
**When** ユーザーが `chromad` を実行  
**Then** `/home/user/.config/chroma/daemon.json` が使用される

---

### Requirement: Default Values

設定が指定されていない場合、以下のデフォルト値が使用されなければならない (SHALL):

- Config: `${XDG_CONFIG_HOME:-$HOME/.config}/chroma/daemon.json`
- Runtime Directory: `${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}/chroma-$UID}/chroma`

#### Scenario: すべてデフォルト値を使用

**Given** `--config` オプションが指定されていない  
**And** `XDG_CONFIG_HOME=/home/user/.config` が設定されている  
**And** `XDG_RUNTIME_DIR=/run/user/1000` が設定されている  
**When** ユーザーが `chromad` を実行  
**Then** `/home/user/.config/chroma/daemon.json` と `/run/user/1000/chroma/chroma.sock` が使用される

#### Scenario: XDG変数がすべて未設定の場合

**Given** すべての環境変数とオプションが未設定  
**And** `HOME=/home/user` が設定されている  
**And** `TMPDIR=/tmp` が設定されている  
**And** ユーザーのUID が `1000`  
**When** ユーザーが `chromad` を実行  
**Then** `/home/user/.config/chroma/daemon.json` と `/tmp/chroma-1000/chroma/chroma.sock` が使用される

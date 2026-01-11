# config-file Specification

## Purpose
TBD - created by archiving change define-config-file-format. Update Purpose after archive.
## Requirements
### Requirement: File Format

設定ファイルは JSON フォーマットでなければならない (SHALL)。

- ファイル拡張子は `.json` でなければならない (SHALL)
- ファイルの内容は有効な JSON でなければならない (SHALL)

#### Scenario: 有効なJSON設定ファイルを読み込む

**Given** 設定ファイル `daemon.json` が有効なJSONで存在する  
**When** chromad が設定ファイルを読み込む  
**Then** 設定ファイルが正常にパースされる

#### Scenario: 無効なJSON設定ファイルを読み込む

**Given** 設定ファイル `daemon.json` が無効なJSON構文を含む  
**When** chromad が設定ファイルを読み込もうとする  
**Then** パースエラーが無視される  
**And** デフォルト値(空のエイリアステーブル)で動作する

---

### Requirement: File Location

設定ファイルは `${XDG_CONFIG_HOME:-$HOME/.config}/chroma/daemon.json` に配置されなければならない (SHALL)。

- `XDG_CONFIG_HOME` が設定されている場合、`$XDG_CONFIG_HOME/chroma/daemon.json` を使用しなければならない (SHALL)
- `XDG_CONFIG_HOME` が設定されていない場合、`$HOME/.config/chroma/daemon.json` を使用しなければならない (SHALL)
- 設定ファイルが存在しない場合、エラーを発生させずにデフォルト値で動作しなければならない (SHALL)

#### Scenario: XDG_CONFIG_HOMEが設定されている環境で設定ファイルを読み込む

**Given** `XDG_CONFIG_HOME=/custom/config` が設定されている  
**And** `/custom/config/chroma/daemon.json` が存在する  
**When** chromad が起動する  
**Then** `/custom/config/chroma/daemon.json` が読み込まれる

#### Scenario: XDG_CONFIG_HOMEが設定されていない環境で設定ファイルを読み込む

**Given** `XDG_CONFIG_HOME` が設定されていない  
**And** `HOME=/home/user` が設定されている  
**And** `/home/user/.config/chroma/daemon.json` が存在する  
**When** chromad が起動する  
**Then** `/home/user/.config/chroma/daemon.json` が読み込まれる

#### Scenario: 設定ファイルが存在しない

**Given** デフォルトパスに設定ファイルが存在しない  
**When** chromad が起動する  
**Then** エラーが発生しない  
**And** 空のエイリアステーブルで動作する

---

### Requirement: Schema Structure

設定ファイルのルートオブジェクトは JSONオブジェクト型でなければならない (SHALL)。

- ルートオブジェクトは `profileAliases` フィールドを含んでもよい (MAY)
- `profileAliases` フィールドが存在しない場合、空のエイリアステーブルとして扱われなければならない (SHALL)
- `profileAliases` フィールドが存在する場合、オブジェクトでなければならない (SHALL)

#### Scenario: profileAliasesフィールドを含む設定ファイルを読み込む

**Given** 設定ファイルに `{"profileAliases": {...}}` が定義されている  
**When** chromad が設定ファイルを読み込む  
**Then** `profileAliases` の内容がエイリアステーブルとして使用される

#### Scenario: profileAliasesフィールドを含まない設定ファイルを読み込む

**Given** 設定ファイルが `{}` である  
**When** chromad が設定ファイルを読み込む  
**Then** 空のエイリアステーブルとして扱われる

#### Scenario: profileAliasesフィールドが不正な型である

**Given** 設定ファイルの `profileAliases` が文字列である `{"profileAliases": "invalid"}`  
**When** chromad が設定ファイルを読み込もうとする  
**Then** バリデーションエラーが無視される  
**And** 空のエイリアステーブルで動作する

---

### Requirement: Aliases Field Schema

`profileAliases` フィールドは、Chromeプロファイルディレクトリ名をキー、エイリアスの配列を値とするオブジェクトでなければならない (SHALL)。

- キー: Chromeプロファイルディレクトリ名
  - `Default` または `/^Profile [1-9]\d*$/` のパターンに一致しなければならない (SHALL)
  - 例: `"Default"`, `"Profile 1"`, `"Profile 2"`, `"Profile 10"`
  - `"Profile 0"`, `"Profile"`, `"profile 1"` などは不正なフォーマット
- 値: 文字列の配列(エイリアスのリスト)
- 同じエイリアスが複数のプロファイルに定義されている場合、動作は未定義である (undefined behavior)
- キーが不正なフォーマットの場合、バリデーションエラーとして扱われなければならない (SHALL)

スキーマ例:
```json
{
  "profileAliases": {
    "Default": ["default", "main"],
    "Profile 2": ["personal", "p"],
    "Profile 3": ["work", "w"]
  }
}
```

#### Scenario: 有効なプロファイルキーフォーマット

**Given** 設定ファイルが以下の内容である:
```json
{
  "profileAliases": {
    "Default": ["main"],
    "Profile 1": ["one"],
    "Profile 2": ["two"],
    "Profile 10": ["ten"]
  }
}
```
**When** chromad が設定ファイルを読み込む  
**Then** すべてのキーが有効なフォーマットとして認識される  
**And** エイリアス解決が正常に動作する

#### Scenario: 不正なプロファイルキーフォーマット(Profile 0)

**Given** 設定ファイルが以下の内容である:
```json
{
  "profileAliases": {
    "Profile 0": ["zero"]
  }
}
```
**When** chromad が設定ファイルを読み込もうとする  
**Then** バリデーションエラーが発生する  
**And** デフォルト値(空のエイリアステーブル)で動作する

#### Scenario: 不正なプロファイルキーフォーマット(小文字のprofile)

**Given** 設定ファイルが以下の内容である:
```json
{
  "profileAliases": {
    "profile 1": ["lowercase"]
  }
}
```
**When** chromad が設定ファイルを読み込もうとする  
**Then** バリデーションエラーが発生する  
**And** デフォルト値(空のエイリアステーブル)で動作する

#### Scenario: 不正なプロファイルキーフォーマット(数字なしのProfile)

**Given** 設定ファイルが以下の内容である:
```json
{
  "profileAliases": {
    "Profile": ["nonum"]
  }
}
```
**When** chromad が設定ファイルを読み込もうとする  
**Then** バリデーションエラーが発生する  
**And** デフォルト値(空のエイリアステーブル)で動作する

#### Scenario: 混在した有効・無効なキー

**Given** 設定ファイルが以下の内容である:
```json
{
  "profileAliases": {
    "Default": ["main"],
    "Profile 1": ["one"],
    "InvalidProfile": ["invalid"]
  }
}
```
**When** chromad が設定ファイルを読み込もうとする  
**Then** バリデーションエラーが発生する(無効なキーが1つでも含まれている)  
**And** デフォルト値(空のエイリアステーブル)で動作する

### Requirement: Error Handling

設定ファイルの読み込みやパースで発生したエラーは、デーモンの起動を妨げてはならない (SHALL NOT)。

- ファイルが存在しない: デフォルト値(空のエイリアステーブル)で動作する
- JSONパースエラー: デフォルト値で動作する
- バリデーションエラー: デフォルト値で動作する
- エラーメッセージはログに記録されるべきである (SHOULD)

#### Scenario: JSONパースエラーが発生してもデーモンが起動する

**Given** 設定ファイルが不正なJSON `{"profileAliases": }` を含む  
**When** chromad が起動する  
**Then** デーモンは正常に起動する  
**And** 空のエイリアステーブルで動作する  
**And** エラーメッセージがログに記録される

#### Scenario: ファイル読み込みエラーが発生してもデーモンが起動する

**Given** 設定ファイルパスが読み取り不可(パーミッションエラー)  
**When** chromad が起動する  
**Then** デーモンは正常に起動する  
**And** 空のエイリアステーブルで動作する  
**And** エラーメッセージがログに記録される

---

### Requirement: Alias Resolution

エイリアスは対応するChromeプロファイルディレクトリ名に解決されなければならない (SHALL)。

- エイリアスが設定ファイルに定義されている場合、対応するプロファイルディレクトリ名を返さなければならない (SHALL)
- エイリアスが設定ファイルに定義されていない場合、入力値をそのまま返さなければならない (SHALL)
- エイリアス解決は大文字小文字を区別しなければならない (SHALL)

#### Scenario: 定義されたエイリアスを解決する

**Given** 設定ファイルに `{"profileAliases": {"Profile 2": ["personal"]}}` が定義されている  
**When** エイリアス `personal` が解決される  
**Then** `Profile 2` が返される

#### Scenario: 定義されていないエイリアスを解決する

**Given** 設定ファイルに `{"profileAliases": {"Profile 2": ["personal"]}}` が定義されている  
**When** エイリアス `work` が解決される  
**Then** `work` がそのまま返される(プロファイルディレクトリ名として扱われる)

#### Scenario: エイリアス解決は大文字小文字を区別する

**Given** 設定ファイルに `{"profileAliases": {"Profile 2": ["personal"]}}` が定義されている  
**When** エイリアス `Personal` が解決される  
**Then** `Personal` がそのまま返される(エイリアスとして認識されない)

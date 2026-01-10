# config-file Specification

## Purpose
TBD - created by archiving change define-config-file-format. Update Purpose after archive.
## Requirements
### Requirement: File Format

設定ファイルは JSON フォーマットでなければならない (SHALL)。

- ファイル拡張子は `.json` でなければならない (SHALL)
- ファイルの内容は有効な JSON でなければならない (SHALL)

#### Scenario: 有効なJSON設定ファイルを読み込む

**Given** 設定ファイル `config.json` が有効なJSONで存在する  
**When** chromad が設定ファイルを読み込む  
**Then** 設定ファイルが正常にパースされる

#### Scenario: 無効なJSON設定ファイルを読み込む

**Given** 設定ファイル `config.json` が無効なJSON構文を含む  
**When** chromad が設定ファイルを読み込もうとする  
**Then** パースエラーが無視される  
**And** デフォルト値(空のエイリアステーブル)で動作する

---

### Requirement: File Location

設定ファイルは `${XDG_CONFIG_HOME:-$HOME/.config}/chroma/config.json` に配置されなければならない (SHALL)。

- `XDG_CONFIG_HOME` が設定されている場合、`$XDG_CONFIG_HOME/chroma/config.json` を使用しなければならない (SHALL)
- `XDG_CONFIG_HOME` が設定されていない場合、`$HOME/.config/chroma/config.json` を使用しなければならない (SHALL)
- 設定ファイルが存在しない場合、エラーを発生させずにデフォルト値で動作しなければならない (SHALL)

#### Scenario: XDG_CONFIG_HOMEが設定されている環境で設定ファイルを読み込む

**Given** `XDG_CONFIG_HOME=/custom/config` が設定されている  
**And** `/custom/config/chroma/config.json` が存在する  
**When** chromad が起動する  
**Then** `/custom/config/chroma/config.json` が読み込まれる

#### Scenario: XDG_CONFIG_HOMEが設定されていない環境で設定ファイルを読み込む

**Given** `XDG_CONFIG_HOME` が設定されていない  
**And** `HOME=/home/user` が設定されている  
**And** `/home/user/.config/chroma/config.json` が存在する  
**When** chromad が起動する  
**Then** `/home/user/.config/chroma/config.json` が読み込まれる

#### Scenario: 設定ファイルが存在しない

**Given** デフォルトパスに設定ファイルが存在しない  
**When** chromad が起動する  
**Then** エラーが発生しない  
**And** 空のエイリアステーブルで動作する

---

### Requirement: Schema Structure

設定ファイルのルートオブジェクトは JSONオブジェクト型でなければならない (SHALL)。

- ルートオブジェクトは `aliases` フィールドを含んでもよい (MAY)
- `aliases` フィールドが存在しない場合、空のエイリアステーブルとして扱われなければならない (SHALL)
- `aliases` フィールドが存在する場合、オブジェクトでなければならない (SHALL)

#### Scenario: aliasesフィールドを含む設定ファイルを読み込む

**Given** 設定ファイルに `{"aliases": {...}}` が定義されている  
**When** chromad が設定ファイルを読み込む  
**Then** `aliases` の内容がエイリアステーブルとして使用される

#### Scenario: aliasesフィールドを含まない設定ファイルを読み込む

**Given** 設定ファイルが `{}` である  
**When** chromad が設定ファイルを読み込む  
**Then** 空のエイリアステーブルとして扱われる

#### Scenario: aliasesフィールドが不正な型である

**Given** 設定ファイルの `aliases` が文字列である `{"aliases": "invalid"}`  
**When** chromad が設定ファイルを読み込もうとする  
**Then** バリデーションエラーが無視される  
**And** 空のエイリアステーブルで動作する

---

### Requirement: Aliases Field Schema

`aliases` フィールドは、Chromeプロファイルディレクトリ名をキー、エイリアスの配列を値とするオブジェクトでなければならない (SHALL)。

- キー: Chromeプロファイルディレクトリ名(例: `"Default"`, `"Profile 2"`)
- 値: 文字列の配列(エイリアスのリスト)
- 同じエイリアスが複数のプロファイルに定義されている場合、動作は未定義である (undefined behavior)

スキーマ例:
```json
{
  "aliases": {
    "Default": ["default", "main"],
    "Profile 2": ["personal", "p"],
    "Profile 3": ["work", "w"]
  }
}
```

#### Scenario: 有効なaliasesスキーマを読み込む

**Given** 設定ファイルが以下の内容である:
```json
{
  "aliases": {
    "Profile 2": ["personal", "p"],
    "Profile 3": ["work"]
  }
}
```
**When** chromad が設定ファイルを読み込む  
**Then** エイリアス `personal` と `p` が `Profile 2` に解決される  
**And** エイリアス `work` が `Profile 3` に解決される

#### Scenario: 1つのプロファイルに複数のエイリアスを定義

**Given** 設定ファイルが以下の内容である:
```json
{
  "aliases": {
    "Profile 2": ["personal", "p", "priv", "private"]
  }
}
```
**When** chromad が設定ファイルを読み込む  
**Then** すべてのエイリアス(`personal`, `p`, `priv`, `private`)が `Profile 2` に解決される

#### Scenario: 複数のプロファイルで同じエイリアスを定義(未定義動作)

**Given** 設定ファイルが以下の内容である:
```json
{
  "aliases": {
    "Profile 2": ["main"],
    "Profile 3": ["main"]
  }
}
```
**When** chromad が設定ファイルを読み込む  
**Then** エイリアス `main` の解決結果は保証されない

---

### Requirement: Error Handling

設定ファイルの読み込みやパースで発生したエラーは、デーモンの起動を妨げてはならない (SHALL NOT)。

- ファイルが存在しない: デフォルト値(空のエイリアステーブル)で動作する
- JSONパースエラー: デフォルト値で動作する
- バリデーションエラー: デフォルト値で動作する
- エラーメッセージはログに記録されるべきである (SHOULD)

#### Scenario: JSONパースエラーが発生してもデーモンが起動する

**Given** 設定ファイルが不正なJSON `{"aliases": }` を含む  
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

**Given** 設定ファイルに `{"aliases": {"Profile 2": ["personal"]}}` が定義されている  
**When** エイリアス `personal` が解決される  
**Then** `Profile 2` が返される

#### Scenario: 定義されていないエイリアスを解決する

**Given** 設定ファイルに `{"aliases": {"Profile 2": ["personal"]}}` が定義されている  
**When** エイリアス `work` が解決される  
**Then** `work` がそのまま返される(プロファイルディレクトリ名として扱われる)

#### Scenario: エイリアス解決は大文字小文字を区別する

**Given** 設定ファイルに `{"aliases": {"Profile 2": ["personal"]}}` が定義されている  
**When** エイリアス `Personal` が解決される  
**Then** `Personal` がそのまま返される(エイリアスとして認識されない)


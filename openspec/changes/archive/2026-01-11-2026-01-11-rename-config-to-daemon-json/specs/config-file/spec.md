# config-file Specification Delta

この変更は `config-file` 仕様に以下の修正を適用します。

## MODIFIED Requirements

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

- キー: Chromeプロファイルディレクトリ名(例: `"Default"`, `"Profile 2"`)
- 値: 文字列の配列(エイリアスのリスト)
- 同じエイリアスが複数のプロファイルに定義されている場合、動作は未定義である (undefined behavior)

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

#### Scenario: 有効なprofileAliasesスキーマを読み込む

**Given** 設定ファイルが以下の内容である:
```json
{
  "profileAliases": {
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
  "profileAliases": {
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
  "profileAliases": {
    "Profile 2": ["main"],
    "Profile 3": ["main"]
  }
}
```
**When** chromad が設定ファイルを読み込む  
**Then** エイリアス `main` の解決結果は保証されない

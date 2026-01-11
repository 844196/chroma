# config-file Specification Delta

## MODIFIED Requirements

### Requirement: Aliases Field Schema

`profileAliases` フィールドは、Chromeプロファイルディレクトリ名をキー、エイリアスの配列を値とするオブジェクトでなければならない (SHALL)。

- キー: Chromeプロファイルディレクトリ名
  - `Default` または `/^Profile \d+$/` のパターンに一致しなければならない (SHALL)
  - 例: `"Default"`, `"Profile 1"`, `"Profile 2"`, `"Profile 3"`
  - `"Profile"`, `"profile 1"` などは不正なフォーマット
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

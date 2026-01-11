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

### Requirement: Zod Schema Definition

`daemon.json` 設定ファイルのZodスキーマを `src/types/daemon-config.ts` に定義しなければならない (SHALL)。

- ファイル名は `daemon-config.ts` でなければならない (SHALL)
- ファイルは `src/types/` ディレクトリに配置されなければならない (SHALL)
- Zodのインポートは `@zod/zod/mini` サブパスエクスポートを使用しなければならない (SHALL)
- スキーマ名は `DaemonConfigSchema` でなければならない (SHALL) (プロジェクト規約: PascalCase + `Schema` サフィックス)
- エクスポートされた型名は `DaemonConfig` でなければならない (SHALL)

#### Scenario: Zodスキーマファイルが正しい場所に作成される

**Given** プロジェクトのsrcディレクトリ構造が存在する  
**When** スキーマファイルを作成する  
**Then** `src/types/daemon-config.ts` にファイルが配置される  
**And** ファイルは `import { z } from '@zod/zod/mini'` を含む

#### Scenario: スキーマ名がプロジェクト規約に従う

**Given** Zodスキーマが定義されている  
**When** スキーマをインポートする  
**Then** `DaemonConfigSchema` という名前でエクスポートされている  
**And** 型は `DaemonConfig` という名前でエクスポートされている

---

### Requirement: Zod Schema Structure

`DaemonConfigSchema` はルートオブジェクトのスキーマとして以下の構造を持たなければならない (SHALL)。

- ルートオブジェクトは `z.object()` でなければならない (SHALL)
- `profileAliases` フィールドは `.optional()` でなければならない (SHALL)
- `profileAliases` フィールドが存在する場合、`z.partialRecord()` を使用して**部分的なマップ構造**(partial record)を定義しなければならない (SHALL)
  - キーの型: `ChromeProfileDirectorySchema` (from `src/types/chrome-profile-directory.ts`)
  - 値の型: `z.array(z.string().check(z.minLength(1))).check(z.minLength(1))`
    - 配列内の各文字列は最小長1でなければならない (SHALL) - 空文字列は拒否される
    - 配列自体の最小長は1でなければならない (SHALL) - 空の配列は拒否される
  - Zod v4 では `z.record()` はすべてのキーが必須となるため、partial recordには `z.partialRecord()` 関数を使用しなければならない (SHALL)
  - すべての可能なプロファイルディレクトリをキーとして含む必要はない (partial record)
  - 空のオブジェクト `{}` は有効である (SHALL)

スキーマ構造例:
```typescript
import { z } from '@zod/zod/mini'
import { ChromeProfileDirectorySchema } from './chrome-profile-directory.ts'

export const DaemonConfigSchema = z.object({
  profileAliases: z.optional(
    z.partialRecord(ChromeProfileDirectorySchema, z.array(z.string().check(z.minLength(1))).check(z.minLength(1))),
  ),
})

export type DaemonConfig = z.infer<typeof DaemonConfigSchema>
```

#### Scenario: profileAliasesフィールドがオプショナルである

**Given** `DaemonConfigSchema` が定義されている  
**When** 空のオブジェクト `{}` をバリデーションする  
**Then** バリデーションが成功する  
**And** `profileAliases` は `undefined` となる

#### Scenario: profileAliasesが正しい型構造を持つ

**Given** `DaemonConfigSchema` が定義されている  
**When** 以下のオブジェクトをバリデーションする:
```json
{
  "profileAliases": {
    "Default": ["main", "default"],
    "Profile 2": ["work"]
  }
}
```
**Then** バリデーションが成功する  
**And** 型推論により `profileAliases` は `Partial<Record<ChromeProfileDirectory, string[]>> | undefined` 型となる

#### Scenario: profileAliasesが空のオブジェクトである

**Given** `DaemonConfigSchema` が定義されている  
**When** 以下のオブジェクトをバリデーションする:
```json
{
  "profileAliases": {}
}
```
**Then** バリデーションが成功する  
**And** `profileAliases` は空のオブジェクトとして扱われる

#### Scenario: 不正なキーフォーマットを拒否する

**Given** `DaemonConfigSchema` が定義されている  
**When** 以下のオブジェクトをバリデーションする:
```json
{
  "profileAliases": {
    "Profile 0": ["invalid"]
  }
}
```
**Then** バリデーションが失敗する  
**And** エラーメッセージが `ChromeProfileDirectorySchema` のバリデーションエラーを含む

#### Scenario: 不正な値の型を拒否する

**Given** `DaemonConfigSchema` が定義されている  
**When** 以下のオブジェクトをバリデーションする:
```json
{
  "profileAliases": {
    "Default": "not-an-array"
  }
}
```
**Then** バリデーションが失敗する  
**And** エラーメッセージが配列型の期待を示す

#### Scenario: 空の配列を拒否する

**Given** `DaemonConfigSchema` が定義されている  
**When** 以下のオブジェクトをバリデーションする:
```json
{
  "profileAliases": {
    "Default": []
  }
}
```
**Then** バリデーションが失敗する  
**And** エラーメッセージが配列の最小長要件を示す

#### Scenario: 空文字列を含む配列を拒否する

**Given** `DaemonConfigSchema` が定義されている  
**When** 以下のオブジェクトをバリデーションする:
```json
{
  "profileAliases": {
    "Default": ["valid", "", "another"]
  }
}
```
**Then** バリデーションが失敗する  
**And** エラーメッセージが文字列の最小長要件を示す

---

### Requirement: Type Export

`DaemonConfig` 型を `DaemonConfigSchema` から推論して明示的にエクスポートしなければならない (SHALL)。

- `z.infer<typeof DaemonConfigSchema>` を使用して型を推論しなければならない (SHALL)
- 型名は `DaemonConfig` でなければならない (SHALL)
- 型は `export type` を使用してエクスポートしなければならない (SHALL)

#### Scenario: スキーマから型が正しく推論される

**Given** `DaemonConfigSchema` が定義されている  
**When** `z.infer<typeof DaemonConfigSchema>` を使用して型を推論する  
**Then** 以下の型構造が得られる:
```typescript
{
  profileAliases?: Partial<Record<ChromeProfileDirectory, string[]>>
}
```

#### Scenario: 型をインポートして使用できる

**Given** `src/types/daemon-config.ts` が存在する  
**When** 別のファイルで `import type { DaemonConfig } from './types/daemon-config.ts'` を実行する  
**Then** TypeScriptの型チェックが正しく動作する  
**And** `DaemonConfig` 型の変数を宣言できる

---

### Requirement: Test Coverage

`DaemonConfigSchema` のユニットテストを `src/types/daemon-config.test.ts` に作成しなければならない (SHALL)。

- ファイル名は `daemon-config.test.ts` でなければならない (SHALL)
- テストは Deno の標準テストフレームワークを使用しなければならない (SHALL)
- 以下のケースをテストしなければならない (SHALL):
  - 空のオブジェクト `{}` が有効
  - `profileAliases` フィールドがオプショナル
  - `profileAliases` が空のオブジェクト `{}` を許可する (partial record)
  - 有効な `profileAliases` 構造をパースできる
  - 不正なプロファイルキー (`Profile 0`, `profile 1`, `Profile` など) を拒否する
  - 不正な値の型 (文字列、数値など) を拒否する
  - 空の配列 `[]` を拒否する
  - 空文字列を含む配列を拒否する
  - 追加の未知なプロパティが存在してもバリデーションが失敗せず、結果から除外される (strip)

#### Scenario: 空のオブジェクトが有効

**Given** テストファイルが存在する  
**When** `DaemonConfigSchema.parse({})` を実行する  
**Then** エラーが発生しない  
**And** 結果は `{ profileAliases: undefined }` または `{}` となる

#### Scenario: 有効なprofileAliases構造をパースできる

**Given** テストファイルが存在する  
**When** 以下のデータをパースする:
```typescript
{
  profileAliases: {
    "Default": ["main"],
    "Profile 2": ["work"]
  }
}
```
**Then** エラーが発生しない  
**And** 結果のオブジェクトが入力と一致する

#### Scenario: 不正なプロファイルキーを拒否する

**Given** テストファイルが存在する  
**When** `profileAliases` に `"Profile 0"`, `"profile 1"`, `"Profile"` をキーとして含むデータをパースする  
**Then** ZodErrorが発生する  
**And** エラーメッセージが不正なキーフォーマットを示す

#### Scenario: 不正な値の型を拒否する

**Given** テストファイルが存在する  
**When** `profileAliases` の値が文字列や数値のデータをパースする  
**Then** ZodErrorが発生する  
**And** エラーメッセージが配列型の期待を示す

#### Scenario: 空の配列を拒否する

**Given** テストファイルが存在する  
**When** `profileAliases` に空の配列 `[]` を含むデータをパースする  
**Then** ZodErrorが発生する  
**And** エラーメッセージが配列の最小長要件を示す

#### Scenario: 空文字列を含む配列を拒否する

**Given** テストファイルが存在する  
**When** `profileAliases` に空文字列を含む配列を持つデータをパースする  
**Then** ZodErrorが発生する  
**And** エラーメッセージが文字列の最小長要件を示す

#### Scenario: 追加の未知なプロパティが無視される

**Given** テストファイルが存在する  
**When** `{ profileAliases: {}, unknownField: "value", anotherField: 123 }` をパースする  
**Then** バリデーションが成功する  
**And** 結果は `{ profileAliases: {} }` となる（未知なプロパティは除外される）


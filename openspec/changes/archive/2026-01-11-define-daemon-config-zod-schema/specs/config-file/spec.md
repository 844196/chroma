# config-file Specification Delta

This delta adds requirements for the Zod schema implementation of the daemon.json configuration file format.

---

## ADDED Requirements

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
    z.partialRecord(
      ChromeProfileDirectorySchema,
      z.array(z.string().check(z.minLength(1))).check(z.minLength(1)),
    ),
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

#### Scenario: 追加の未知なプロパティが無視される

**Given** テストファイルが存在する  
**When** `{ profileAliases: {}, unknownField: "value", anotherField: 123 }` をパースする  
**Then** バリデーションが成功する  
**And** 結果は `{ profileAliases: {} }` となる（未知なプロパティは除外される）

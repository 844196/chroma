# Implementation Tasks

以下のタスクを順番に実行して、`profileAliases` キーフォーマット制約を実装します。

## Task 1: Update config-file spec

- [x] **Completed**

**Description**: `openspec/specs/config-file/spec.md` の `Requirement: Aliases Field Schema` セクションを更新し、キーフォーマット制約を追加します。

**Changes**:
- キーが `Default` または `/^Profile \d+$/` のパターンに一致する必要があることを明記
- 不正なフォーマットの動作(バリデーションエラー)を追加
- 有効・無効なキーの例を追加

**Validation**:
- 既存のシナリオと新しいシナリオが矛盾しないことを確認
- 他の要件との一貫性を確認

**Dependencies**: None

**Estimated effort**: Small

---

## Task 2: Add validation scenarios

- [x] **Completed**

**Description**: 新しいシナリオをspecに追加して、有効・無効なキーフォーマットの動作を明確化します。

**Changes**:
- `Scenario: 有効なプロファイルキーフォーマット`
- `Scenario: 不正なプロファイルキーフォーマット(小文字のprofile)`
- `Scenario: 不正なプロファイルキーフォーマット(数字なしのProfile)`
- `Scenario: 混在した有効・無効なキー`

**Validation**:
- すべてのシナリオにGiven-When-Thenが含まれていることを確認
- 境界ケースがカバーされていることを確認

**Dependencies**: Task 1

**Estimated effort**: Small

---

## Task 3: Update implementation (Zod Miniスキーマ)

- [x] **Completed**

**Description**: Zod Miniを用いてChromeプロファイルディレクトリ名のバリデーションスキーマを実装し、キーフォーマット制約を追加します。

**Changes**:
- `src/types/chrome-profile-directory.ts` を作成
- Zod Mini (`@zod/zod/mini`) を使用してスキーマを定義 (https://zod.dev/packages/mini)
- スキーマ名: `ChromeProfileDirectorySchema`
- 型エイリアス名: `ChromeProfileDirectory`
- `profileAliases` のキーが `/^Default$|^Profile \d+$/` パターンに一致することをバリデート
- 設定ファイル読み込み処理でこのスキーマを使用
- バリデーションエラー時にデフォルト値を返すロジックを実装

**Validation**:
- 有効なキー(`Default`, `Profile 1`)が正しく認識される
- 無効なキー(`profile 1`, `Profile`)がバリデーションエラーとなる
- エラー時にデフォルト値で動作する
- エラーメッセージがログに記録される

**Dependencies**: Task 2

**Estimated effort**: Medium

---

## Task 4: Add unit tests

- [x] **Completed**

**Description**: キーフォーマットバリデーションのユニットテストを追加します。

**Changes**:
- 有効なキー(`Default`, `Profile 1`, `Profile 10`)のテスト
- 無効なキー(`profile 1`, `Profile`)のテスト
- 混在ケースのテスト
- エラーハンドリングのテスト

**Validation**:
- すべてのテストがパスする
- `mise run test` が成功する

**Dependencies**: Task 3

**Estimated effort**: Medium

---

## Task 5: Update documentation

- [x] **Completed**

**Description**: README.mdおよびその他のドキュメントを更新して、キーフォーマット制約を反映します。

**Changes**:
- `daemon.json` の例を更新(有効なキーのみ使用)
- キーフォーマットの説明を追加
- エラー動作の説明を追加

**Validation**:
- ドキュメントの例がすべて有効なフォーマットを使用している
- ユーザーが正しいフォーマットを理解できる

**Dependencies**: Task 4

**Estimated effort**: Small

---

## Summary

- **Total tasks**: 5
- **All tasks completed**: ✅
- **Parallelizable**: Task 1-2 can be done together
- **Sequential dependencies**: Task 3 → Task 4 → Task 5
- **Estimated total effort**: Medium

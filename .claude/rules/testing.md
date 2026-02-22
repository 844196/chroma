---
description: テスト規約
paths:
  - "**/*.test.ts"
---

- テストファイルはテスト対象ファイルと同じディレクトリに `*.test.ts` として配置します。
- Effect-TSのコードのテストには `@effect/vitest` を使用します。
- `describe` / `it` の記述は日本語で統一します。
  - `describe`: 最上位にはクラス名・モジュール名等の技術的識別子をそのまま使用します。ネストした `describe` にはメソッド名等の技術的識別子、または日本語のシナリオ説明（例: `〜の場合`）を使用します。
  - `it`: `〜こと` で終わる日本語の文にします。

  ```ts
  describe('CommandExecutor', () => {
    describe('exec', () => {
      describe('コマンドが終了コード0で終了した場合', () => {
        it.effect('成功とみなされること', () => ...)
      })
    })
  })
  ```

- 型の絞り込みが必要な場合、`expect` で値を検証した直後に `@effect/vitest` の `assert` で型ガードします。`assert` 単体ではテスト失敗時のメッセージが不十分なため、必ず `expect` を先行させます。

  ```ts
  expect(Exit.isFailure(result)).toBe(true)
  assert(Exit.isFailure(result))  // 型が絞り込まれ、以降 result.cause にアクセスできる
  ```

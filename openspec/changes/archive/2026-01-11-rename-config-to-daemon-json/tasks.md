# Implementation Tasks

この変更を実装するための具体的なタスクを以下に示します。各タスクは小さく検証可能な単位で、ユーザーに見える進捗を提供します。

## Task 1: Update runtime.ts to use daemon.json

**Description**: `src/runtime.ts` の `defaultConfigPath()` 関数を更新して、`config.json` の代わりに `daemon.json` を返すようにします。

**Files**:
- `src/runtime.ts`

**Changes**:
- `defaultConfigPath()` 内のファイル名を `config.json` から `daemon.json` に変更

**Validation**:
- `mise run check:type -- src/runtime.ts` が成功する
- `mise run test -- src/runtime.test.ts` が成功する(テストケースも更新が必要)

**Dependencies**: None

---

## Task 2: Update runtime tests to use daemon.json

**Description**: `src/runtime.test.ts` のテストケースを更新して、期待されるファイル名を `daemon.json` に変更します。

**Files**:
- `src/runtime.test.ts`

**Changes**:
- テスト内のアサーションで `config.json` を `daemon.json` に変更

**Validation**:
- `mise run test -- src/runtime.test.ts` が成功する

**Dependencies**: Task 1

---

## Task 3: Remove CHROMA_CONFIG environment variable from CLI

**Description**: `src/cli/chromad.ts` から `CHROMA_CONFIG` 環境変数の定義を削除します。

**Files**:
- `src/cli/chromad.ts`

**Changes**:
- `.env('CHROMA_CONFIG=<PATH:string>', ...)` の呼び出しを削除

**Validation**:
- `mise run check:type -- src/cli/chromad.ts` が成功する
- `mise run build` が成功し、`build/chromad --help` の出力に `CHROMA_CONFIG` が表示されない

**Dependencies**: None (Task 1-2と並行実施可能)

---

## Task 4: Update server implementation to use profileAliases

**Description**: サーバー実装で設定ファイルのスキーマを更新し、`aliases` フィールドを `profileAliases` に変更します。これにはバリデーションスキーマ(Zod)と型定義の更新が含まれます。

**Files**:
- `src/server.ts` (または設定読み込みロジックが存在するファイル)

**Changes**:
- 設定ファイルのZodスキーマで `aliases` を `profileAliases` に変更
- 型定義を更新
- エイリアス解決ロジックで新しいフィールド名を使用

**Validation**:
- `mise run check:type` が成功する
- 手動で `daemon.json` を作成し、`profileAliases` フィールドが正しく読み込まれることを確認
- エイリアス解決が正常に動作することを確認

**Dependencies**: Task 1, Task 2 (runtime層の更新が完了している必要がある)

---

## Task 5: Update documentation

**Description**: README.md およびその他のドキュメントを更新して、新しいファイル名 `daemon.json`、フィールド名 `profileAliases`、および `CHROMA_CONFIG` の削除を反映します。

**Files**:
- `README.md`

**Changes**:
- すべての `config.json` への参照を `daemon.json` に変更
- すべての `aliases` フィールドの例を `profileAliases` に変更
- `CHROMA_CONFIG` 環境変数の説明を削除
- systemd ユニットファイルの例から `Environment=CHROMA_CONFIG=...` 行を削除

**Validation**:
- ドキュメントを読んで、変更が一貫していることを確認
- コードと一致することを確認

**Dependencies**: Task 1-4 (すべての実装が完了している必要がある)

---

## Task 6: Update spec files (archive change)

**Description**: openspec コマンドを使用して、この変更をアーカイブし、main specs を更新します。

**Command**:
```bash
openspec archive 2026-01-11-rename-config-to-daemon-json
```

**Validation**:
- `openspec list --specs` でスペックの要件数が正しいことを確認
- `openspec show config-file --type spec` で `daemon.json` と `profileAliases` が反映されていることを確認
- `openspec show cli-chromad --type spec` で `CHROMA_CONFIG` 環境変数が削除されていることを確認

**Dependencies**: Task 5 (すべてのドキュメントが更新されている必要がある)

---

## Parallelization Opportunities

以下のタスクは並行実施可能です:
- Task 1 & Task 2 (runtime層)
- Task 3 (CLI層)

Task 4 は Task 1-2 の完了後に開始できます。
Task 5 は Task 1-4 の完了後に開始します。
Task 6 は最後に実行します。

## Rollback Strategy

各タスクは Git コミットとして個別に管理し、問題が発生した場合は該当コミットを revert できるようにします。特に Task 4 (server implementation) は慎重にテストし、既存の動作を壊さないことを確認します。

# Implementation Tasks

この変更を実装するためのタスクリストです。各タスクは順番に実行し、完了したら `[x]` でマークしてください。

## Specification Updates

- [x] [openspec/specs/config-file/spec.md](../../../specs/config-file/spec.md) の `Aliases Field Schema` 要件を更新
  - パターンを `/^Profile \d+$/` から `/^Profile [1-9]\d*$/` に変更
  - `Profile 0` が不正なフォーマットであることを明記
  - 新しいシナリオ「不正なプロファイルキーフォーマット(Profile 0)」を追加

## Implementation Updates

- [x] [src/types/chrome-profile-directory.ts](../../../src/types/chrome-profile-directory.ts) の正規表現パターンを更新
  - `/^Profile \d+$/` を `/^Profile [1-9]\d*$/` に変更
  - コメントを更新して `Profile 0` が無効であることを明示
  - エラーメッセージを更新(必要であれば)

- [x] [src/types/chrome-profile-directory.test.ts](../../../src/types/chrome-profile-directory.test.ts) にテストケースを追加
  - `Profile 0` が拒否されることを検証するテストを追加
  - 既存のテストがすべてパスすることを確認

## Validation

- [x] すべてのテストを実行して成功を確認
  - `mise run test -- src/types/chrome-profile-directory.test.ts`
  
- [x] 型チェック、リント、フォーマットチェックを実行
  - `mise run check`

- [x] OpenSpec検証を実行
  - `openspec validate restrict-profile-number-to-positive-integers --strict`

## Documentation

- [x] 変更内容を確認し、必要に応じてコミットメッセージを準備
  - Breaking change であることを明記
  - PR #12 のコードレビューコメントを参照

## Notes

- この変更は **破壊的変更** ですが、実際のChromeは `Profile 0` を使用しないため、影響はないはずです
- すべてのタスクが完了したら、proposal.md の Success Criteria をチェックしてください

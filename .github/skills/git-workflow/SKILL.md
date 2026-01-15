---
name: git-workflow
description: このプロジェクトにおけるGitワークフロー
---

# Git Workflow

## Commit

### Commit Message Conventions

コミットメッセージは常に [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従います。

#### Format

```
<type>[(optional scope)]: <description>
```

#### Types

- `feat:` - 新機能の追加
- `fix:` - バグ修正
- `refactor:` - リファクタリング
- `docs:` - ドキュメントの追加・更新
- `style:` - フォーマット修正 (コードの動作に影響しない変更)
- `perf:` - パフォーマンス改善
- `test:` - テストコードの追加・修正
- `chore:` - メンテナンス作業

**Common Scopes**: `server`, `config`, `chroma-cli`, `chromad-cli`, `deps`

#### Examples

- `feat(chroma-cli): add new options for foobar`
- `fix(server): resolve validation issue in user input`
- `chore(deps): update Deno to X.Y.Z`

### Pre-Commit Process

1. `mise run fix` を実行してコードフォーマットとリンティングを自動修正する。
2. `mise run test` を実行して全テストが通過することを確認する。
3. `mise run check` を実行して型チェック・フォーマット・リンターを確認する。

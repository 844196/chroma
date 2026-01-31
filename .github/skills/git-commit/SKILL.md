---
name: git-commit
description: このプロジェクトにおけるGitコミットの手順とコミットメッセージの規約に従って、適切なコミットメッセージを生成し、変更をコミットします。ユーザーから「コミットして」と指示された際に使用します。
---

# Git Commit

## Workflow

### 1. Check Staged Changes

コミット可能かどうかを確認するため、まずステージされた変更を確認します。

```bash
git diff --cached --stat
```

もし変更がない場合は、ユーザーに `git add` した上で続行するかを確認します。

### 2. Analyze Diff

変更内容を詳細に確認します。

```bash
git diff --cached
```

### 3. Generate Commit Message

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従ってコミットメッセージを生成します。

#### Format

```
<type>(<scope>): <subject>

[body]
```

#### Types

変更内容に最も適したタイプを選択します。

- `feat:` - 新機能の追加
- `fix:` - バグ修正
- `refactor:` - リファクタリング
- `docs:` - ドキュメントの追加・更新
- `style:` - フォーマット修正 (コードの動作に影響しない変更)
- `perf:` - パフォーマンス改善
- `test:` - テストコードの追加・修正
- `chore:` - メンテナンス作業
  - `chore(deps):` - 依存関係の更新

**Common Scopes**: `server`, `client`, `deps`

`feat` や `fix` は "エンドユーザーから見た時、この変更がどう映るか" を基準に選択します。何かを "修正" した場合でも、エンドユーザーに影響がないのであれば `refactor` や `chore` を選択すべきです。

#### Subject

変更内容を元に「どのような変更を行ったか」を英語で簡潔に伝えます。

- **常に** 現在形の命令形で始める (e.g. `add`, `implement`, `fix`, `improve`, `enhance`, `refactor`, `remove`)
- **常に** タイトルは50文字以内
- **決して** 大文字で始めない
- **決して** ピリオドで終わらせない
- **決して** 内容のないコミットメッセージにしない (e.g. `update`, `fix bugs`)

### 4. Commit Changes

生成したコミットメッセージを使用して変更をコミットします。

```bash
# Simple
git commit -m "<type>(<scope>): <subject>"
```

```bash
# With Body
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

[body]
EOF
)"
```

## Commit Message Examples

- `feat(client): add new options for foobar`
- `fix(server): resolve validation issue in user input`
- `chore(deps): update foobar to X.Y.Z`

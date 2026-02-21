---
paths:
  - "mise.toml"
  - ".github/workflows/*.{yaml,yml}"
---

# mise バージョンの整合性について

このプロジェクトではローカル開発環境および GitHub Actions 環境において、mise を使用したラインタイム・ツールバージョンの固定やタスクランナー機能を使用しています。

mise バージョン不整合によるトラブルを未然に回避するため `mise.toml` 内の `min_version` は GitHub Actions ワークフロー内の `mise` アクションで使用されるバージョンと一致しているべきです。

```toml
# mise.toml

min_version = "2026.2.17"
```

```yaml
# .github/workflows/some-workflow.yaml

jobs:
  some-job:
    steps:
      - uses: jdx/mise-action
        with:
          version: 2026.2.17
```

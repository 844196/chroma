# Project Context

## Project Conventions

### Specification Style

仕様文書は**振る舞いを自然言語で記述する**ことを原則とします:

- **記述すべき内容**: システムの振る舞い、入力と出力、エラーハンドリング、状態遷移
- **記述すべきでない内容**: 実装の詳細、Zodスキーマ定義、関数シグネチャ、クラス構造
- **例外**: APIコントラクト(エンドポイント、RPCシグネチャ)、設定ファイル構造、CLI構文など外部インターフェースは記述可能

**良い例**:

```markdown
### Requirement: エイリアス解決

システムはプロファイルエイリアスをディレクトリ名に解決しなければならない(SHALL)。

#### Scenario: 定義されたエイリアスを解決

- **GIVEN** 設定ファイルにエイリアス "personal" が "Profile 2" にマッピングされている
- **WHEN** クライアントが "personal" プロファイルをリクエスト
- **THEN** システムは "Profile 2" を返す
```

**悪い例** (実装の詳細を含む):

````markdown
### Requirement: Zodスキーマ定義

`DaemonConfigSchema` は以下のように定義されなければならない:

```typescript
export const DaemonConfigSchema = z.object({...})
```
````

この方針により:

- 仕様と実装の分離を保ち、リファクタリングの自由度を確保
- レビュー時の「仕様との一貫性」指摘が振る舞いの差異に集中
- 仕様文書の可読性と保守性を向上

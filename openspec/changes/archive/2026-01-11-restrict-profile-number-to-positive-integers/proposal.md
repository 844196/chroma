# Proposal: Restrict Profile Number to Positive Integers

**Change ID:** `restrict-profile-number-to-positive-integers`  
**Status:** Proposed  
**Created:** 2026-01-11

## Summary

Chromeプロファイルディレクトリ名のフォーマット仕様を `Profile <1以上の整数>` に制限し、`Profile 0` を不正なフォーマットとして扱うようにします。

## Background

現在の実装では、プロファイルディレクトリ名のパターンとして `/^Profile \d+$/` を使用しており、`Profile 0` も有効として認識されます。

PR #12 のコードレビュー ([discussion_r2679489920](https://github.com/844196/chroma/pull/12#discussion_r2679489920)) で、Chromeは追加プロファイルを `Profile 1` から始める挙動が指摘されました。`Profile 0` は実際には使用されないため、仕様と実装を実態に合わせる必要があります。

## Motivation

- **正確性**: Chromeの実際の挙動に合わせた仕様にする
- **予防**: `Profile 0` のような無効な設定によるユーザーの混乱を防ぐ
- **一貫性**: 設定ファイルのバリデーションを厳密にし、予期しない動作を排除する

## Proposed Changes

### 影響を受けるコンポーネント

1. **config-file specification** (MODIFIED)
   - `Aliases Field Schema` 要件のキーフォーマットを更新
   - パターンを `/^Profile \d+$/` から `/^Profile [1-9]\d*$/` に変更
   - シナリオを追加して `Profile 0` を不正として明確化

### Detailed Changes

#### config-file

- **MODIFIED Requirement: Aliases Field Schema**
  - キーのフォーマットパターンを `/^Profile [1-9]\d*$/` に変更
  - `Profile 0` が不正なフォーマットとして扱われることを明示
  - シナリオを追加: `Profile 0` が拒否されることを検証

## Implementation Impact

### Affected Files

- `openspec/specs/config-file/spec.md`: 仕様の更新
- `src/types/chrome-profile-directory.ts`: 正規表現パターンの更新
- `src/types/chrome-profile-directory.test.ts`: テストケースの追加

### Breaking Changes

**あり** - 既存の設定ファイルで `Profile 0` を使用している場合、バリデーションエラーになります。

ただし、実際のChromeでは `Profile 0` を使用しないため、影響を受けるユーザーは理論上存在しないと考えられます。

### Migration Path

設定ファイルで `Profile 0` を使用しているユーザー(存在するなら)は、以下のいずれかに変更する必要があります:
- `Default` を使用する(デフォルトプロファイル)
- `Profile 1` 以上を使用する(追加プロファイル)

## Risks & Mitigations

### Risks

1. **破壊的変更**: 理論上、`Profile 0` を使用している設定が動作しなくなる
   - **Likelihood**: 極めて低い (Chromeが実際に `Profile 0` を作成しないため)
   - **Impact**: 中程度 (設定ファイルの修正が必要)
   
2. **実装の複雑性**: 正規表現パターンの変更が必要
   - **Likelihood**: なし
   - **Impact**: 低い (単純なパターン変更)

### Mitigations

- PR #12 で実装前に仕様を確定することで、後方互換性の問題を回避
- 明確なエラーメッセージにより、もし `Profile 0` を使用しているユーザーがいれば、適切なガイダンスを提供できる

## Alternatives Considered

### 1. 現状維持 (`/^Profile \d+$/`)

**Pros:**
- コード変更が不要
- 破壊的変更のリスクがゼロ

**Cons:**
- Chromeの実際の挙動と仕様が乖離
- `Profile 0` のような無効な設定を受け入れてしまう

**Decision:** 採用しない。仕様の正確性を優先する。

### 2. `Profile 0` を警告のみで受け入れる

**Pros:**
- 既存の設定(もしあれば)が動作し続ける
- より緩やかな移行

**Cons:**
- 無効な設定を容認することになる
- 将来的な問題の原因となる可能性

**Decision:** 採用しない。早期に厳密な仕様を確立する。

## Success Criteria

- [ ] 仕様が更新され、`Profile 0` が明示的に不正として扱われる
- [ ] 実装が新しい正規表現パターン `/^Profile [1-9]\d*$/` を使用する
- [ ] `Profile 0` を拒否するテストケースが追加される
- [ ] 既存のテストがすべてパスする
- [ ] `openspec validate --strict` がエラーなく完了する

## Timeline

1. ✅ Proposal作成
2. ⏳ Review & Approval
3. ⏳ Implementation (tasks.md参照)
4. ⏳ Testing & Validation
5. ⏳ Archive

## Related Changes

- この変更は PR #12 に含まれる予定です
- アーカイブされた変更 `2026-01-11-restrict-profile-aliases-key-format` でプロファイルエイリアスキーのフォーマット制約が最近導入されたばかりで、この変更はその制約をさらに厳密にするものです

# Proposal: Define Daemon Config Zod Schema

## Motivation

現在、`daemon.json` 設定ファイルのスキーマは仕様書に文書化されていますが、実装レベルでのバリデーションスキーマ定義が存在しません。設定ファイルの読み込み・パース・バリデーション処理を実装する前に、Zodスキーマを定義する必要があります。

プロジェクトでは以下の技術スタックを採用しています:
- **Zod** (`@zod/zod/mini`): サーバーサイドバリデーション用のスキーマバリデーションライブラリ
- プロジェクト規約: Zodスキーマは PascalCase で `～Schema` サフィックスを付ける

既存の `ChromeProfileDirectorySchema` と同様に、型安全な設定ファイルのスキーマ定義が求められています。

## Goal

`src/types/daemon-config.ts` に以下を定義します:

1. **DaemonConfigSchema**: `daemon.json` のルートオブジェクトを表すZodスキーマ
2. **DaemonConfig型**: スキーマから推論される TypeScript 型

これにより:
- 設定ファイルの読み込み処理で型安全なバリデーションを実行できる
- 設定データに対して静的型チェックを利用できる
- 仕様書との一貫性を実装レベルで保証できる

## Scope

この変更は**型定義**に限定されます:
- **含む**: Zodスキーマ定義、TypeScript型エクスポート、スキーマのユニットテスト
- **含まない**: 設定ファイルの読み込みロジック、エイリアス解決ロジック、サーバー/クライアント統合

設定ファイルの実際の読み込み処理やエイリアス解決処理は、別の変更プロポーザルで対応します。

## Non-Goals

- 設定ファイル読み込み・パース処理の実装
- エイリアス解決ロジックの実装
- サーバー/クライアントへの統合
- 既存コードのリファクタリング

## Constraints

- Zodは `/mini` サブパスエクスポートを使用する必要がある (`@zod/zod/mini`)
- スキーマ名は PascalCase で `～Schema` サフィックスを付ける (プロジェクト規約)
- `ChromeProfileDirectorySchema` を再利用する (`src/types/chrome-profile-directory.ts`)
- 仕様書 `config-file` の要件を完全に満たす
  - `profileAliases` フィールドはオプショナル
  - `profileAliases` は部分的なレコード (partial record) - すべてのプロファイルをキーとして含む必要はない
  - Zod v4 では `z.partialRecord()` 関数を使用する必要がある ([Zod v4 Changelog](https://zod.dev/v4/changelog?id=zrecord))
  - キーは `ChromeProfileDirectory` 型 (既存スキーマ)
  - 値は文字列の配列
  - 空のオブジェクト `{}` は有効

## Dependencies

このプロポーザルは以下に依存します:
- `src/types/chrome-profile-directory.ts` の `ChromeProfileDirectorySchema` (既存)

このプロポーザルに依存する将来の変更:
- 設定ファイル読み込み処理の実装
- エイリアス解決ロジックの実装

## Risks & Mitigations

### Risk: Zodスキーマの複雑性
**Mitigation**: シンプルな構造 (オブジェクト + 配列) のため、複雑性は低い。既存の `ChromeProfileDirectorySchema` を再利用することでさらに簡潔に保てる。

### Risk: 将来的な設定フォーマット変更
**Mitigation**: Zodの `.passthrough()` や `.catchall()` は使わず、明示的なスキーマ定義のみを行う。フォーマット変更時は仕様書とスキーマの両方を更新する必要があるが、これは意図的な設計。

## Alternatives Considered

### Alternative 1: TypeScriptインターフェースのみを定義
**Rejected**: ランタイムバリデーションができず、不正な設定ファイルを検出できない。

### Alternative 2: JSON Schemaを使用
**Rejected**: プロジェクトではZodを標準として採用済み。Honoとの統合も容易。

### Alternative 3: スキーマ定義を後回しにする
**Rejected**: 設定ファイル読み込み実装前にスキーマを確定させることで、実装時の手戻りを防ぐ。

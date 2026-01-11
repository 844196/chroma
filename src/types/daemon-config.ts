import { z } from '@zod/zod/mini'
import { ChromeProfileDirectorySchema } from './chrome-profile-directory.ts'

/**
 * daemon.json設定ファイルのZodスキーマ
 *
 * 設定ファイル構造:
 * - profileAliases: プロファイルディレクトリ名とエイリアスのマッピング（オプショナル）
 *   - キー: ChromeProfileDirectory型（"Default" または "Profile N"）
 *   - 値: エイリアスの配列（文字列の配列）
 *   - 部分的なレコード（partial record）: すべてのキーが必須ではない
 *
 * @example
 * ```typescript
 * const config: DaemonConfig = {
 *   profileAliases: {
 *     "Default": ["main", "default"],
 *     "Profile 2": ["work", "w"]
 *   }
 * }
 * ```
 */
export const DaemonConfigSchema = z.object({
  profileAliases: z.optional(
    z.partialRecord(ChromeProfileDirectorySchema, z.array(z.string().check(z.minLength(1))).check(z.minLength(1))),
  ),
})

/**
 * daemon.json設定ファイルの型
 */
export type DaemonConfig = z.infer<typeof DaemonConfigSchema>

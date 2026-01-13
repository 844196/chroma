import { z } from '@zod/zod/mini'
import { ChromeProfileDirectorySchema } from '../types/chrome-profile-directory.ts'

/**
 * 設定ファイルのZodスキーマ
 */
export const DaemonConfigSchema = z.object({
  profileAliases: z._default(
    z.partialRecord(
      ChromeProfileDirectorySchema,
      z.array(z.string().check(z.minLength(1))).check(z.minLength(1)),
    ),
    {},
  ),
})

/**
 * 設定ファイルの型
 */
export type DaemonConfig = z.infer<typeof DaemonConfigSchema>

/**
 * 設定ファイルが存在しない、またはパース失敗時のデフォルト
 */
export const DEFAULT_DAEMON_CONFIG = {
  profileAliases: {},
} as const satisfies DaemonConfig

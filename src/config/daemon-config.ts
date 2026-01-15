import { z } from '@zod/zod/mini'
import { ProfileAliasMapSchema } from '../features/chrome/profile.ts'

export const DaemonConfigSchema = z.object({
  profileAliases: z._default(ProfileAliasMapSchema, new Map()),
})

export type DaemonConfig = z.infer<typeof DaemonConfigSchema>

/**
 * 設定ファイルが存在しない、またはパース失敗時のデフォルト
 */
export const DEFAULT_DAEMON_CONFIG = {
  profileAliases: new Map(),
} as const satisfies DaemonConfig

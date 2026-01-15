import { z } from '@zod/zod/mini'
import { ProfileAliasMapSchema } from './profile.ts'

export const DaemonConfigSchema = z.object({
  profileAliases: z._default(z.optional(ProfileAliasMapSchema), {}),
})

export type DaemonConfig = z.infer<typeof DaemonConfigSchema>

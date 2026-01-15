import { z } from '@zod/zod/mini'
import { ProfileAliasMapSchema } from '../features/chrome/profile.ts'

export const ConfigSchema = z.object({
  profileAliases: z._default(z.optional(ProfileAliasMapSchema), {}),
})

export type Config = z.infer<typeof ConfigSchema>

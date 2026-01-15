import { z } from '@zod/zod/mini'
import { ProfileSchema } from './profile.ts'

export const DaemonConfigSchema = z.object({
  profileAliases: z.optional(
    z.partialRecord(ProfileSchema, z.array(z.string().check(z.minLength(1))).check(z.minLength(1))),
  ),
})

export type DaemonConfig = z.infer<typeof DaemonConfigSchema>

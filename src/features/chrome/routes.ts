import { Hono } from '@hono/hono'
import { zValidator } from '@hono/zod-validator'
import { z } from '@zod/zod/mini'
import { ServerEnv } from '../../shared/server-env.ts'
import { ProfileAliasSchema, ProfileSchema } from './profile.ts'

const OpenRequestSchema = z.object({
  args: z.array(z.string().check(z.trim(), z.minLength(1))),
  profile: z.optional(z.union([ProfileSchema, ProfileAliasSchema])),
})

export const chromeRoutes = new Hono<ServerEnv>()
  .post(
    '/open',
    zValidator('json', OpenRequestSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }
    }),
    async (c) => {
      const { profile, args } = c.req.valid('json')

      await c.env.container.get('chromeService').open(profile ?? null, ...args)

      return c.json({}, 200)
    },
  )

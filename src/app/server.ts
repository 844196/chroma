import { Hono } from '@hono/hono'
import { PatternRouter } from '@hono/hono/router/pattern-router'
import { zValidator } from '@hono/zod-validator'
import { z } from '@zod/zod/mini'
import { type ChromeService } from '../features/chrome/chrome-service.ts'
import { ProfileAliasSchema, ProfileSchema } from '../features/chrome/profile.ts'

const OpenRequestSchema = z.object({
  profile: z.union([ProfileSchema, ProfileAliasSchema]),
  args: z.array(z.string().check(z.minLength(1))),
})

type ServerDependencies = {
  chromeService: ChromeService
}

export function createServer(deps: ServerDependencies) {
  const server = new Hono<{ Variables: ServerDependencies }>({
    // https://hono.dev/docs/concepts/routers#patternrouter
    router: new PatternRouter(),

    // https://github.com/orgs/honojs/discussions/4145#discussioncomment-13181621
    getPath: (req) => new URL(req.url).pathname,
  })
    .use(async (c, next) => {
      c.set('chromeService', deps.chromeService)
      await next()
    })
    .post('/open', zValidator('json', OpenRequestSchema), async (c) => {
      const { profile, args } = c.req.valid('json')

      await c.var.chromeService.open(profile, ...args)

      return c.json({ status: 'ok' as const })
    })

  return server
}

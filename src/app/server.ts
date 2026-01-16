import { Hono } from '@hono/hono'
import { PatternRouter } from '@hono/hono/router/pattern-router'
import { chromeRoutes } from '../features/chrome/routes.ts'
import type { Container } from '../shared/container.ts'
import type { ServerEnv } from '../shared/server-env.ts'

export function createServer(container: Container) {
  const server = new Hono<ServerEnv>({
    // https://hono.dev/docs/concepts/routers#patternrouter
    router: new PatternRouter(),

    // https://github.com/orgs/honojs/discussions/4145#discussioncomment-13181621
    getPath: (req) => new URL(req.url).pathname,
  })
    .use(async (c, next) => {
      c.env.container = container
      await next()
    })
    .route('/chrome', chromeRoutes)

  return server
}

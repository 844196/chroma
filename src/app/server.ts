import { Hono } from '@hono/hono'
import { PatternRouter } from '@hono/hono/router/pattern-router'
import type { Container } from '../shared/container.ts'

export function createServer(container: Container) {
  const server = new Hono({
    // https://hono.dev/docs/concepts/routers#patternrouter
    router: new PatternRouter(),

    // https://github.com/orgs/honojs/discussions/4145#discussioncomment-13181621
    getPath: (req) => new URL(req.url).pathname,
  })
    .use(async (c, next) => {
      c.set('container', container)
      await next()
    })

  return server
}

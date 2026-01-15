import { Hono } from '@hono/hono'
import { PatternRouter } from '@hono/hono/router/pattern-router'
import { type DaemonConfig } from './config/daemon-config.ts'

export function createServer(_config: DaemonConfig) {
  return new Hono({
    // https://hono.dev/docs/concepts/routers#patternrouter
    router: new PatternRouter(),

    // https://github.com/orgs/honojs/discussions/4145#discussioncomment-13181621
    getPath: (req) => new URL(req.url).pathname,
  })
}

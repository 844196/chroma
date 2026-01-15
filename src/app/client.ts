import { hc } from '@hono/hono/client'
import { type createServer } from './server.ts'

export function createClient(socketPath: string) {
  const socketClient = Deno.createHttpClient({ proxy: { transport: 'unix', path: socketPath } })

  return hc<ReturnType<typeof createServer>>('http://localhost', {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, client: socketClient }),
  })
}

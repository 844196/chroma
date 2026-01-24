import { FileSystem } from '@effect/platform'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { Effect } from 'effect'
import { appRouter } from './routers/_app.ts'
import { ENDPOINT_BASE_URL } from './trpc.ts'

const UnixSocket = (path: string) => {
  const acquire = Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const alreadyExists = yield* fs.exists(path)
    if (alreadyExists) {
      return yield* Effect.dieMessage(`Address already in use: ${path}`)
    }

    return { path }
  })

  const release = () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem

      yield* Effect.orDie(fs.remove(path))
    })

  return Effect.acquireRelease(acquire, release)
}

export const startServer = Effect.fn('startServer')(function* (socketPath: string) {
  const router = yield* appRouter
  const socket = yield* UnixSocket(socketPath)

  const handle = Effect.async((resume, signal) => {
    const srv = Bun.serve({
      unix: socket.path,
      fetch: (req) => fetchRequestHandler({ endpoint: ENDPOINT_BASE_URL.pathname, router, req }),
    })
    signal.addEventListener('abort', async () => {
      await srv.stop()
      resume(Effect.void)
    })
  })

  yield* handle
})

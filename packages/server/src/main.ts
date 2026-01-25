import { BunContext, BunRuntime } from '@effect/platform-bun'
import { Effect, Layer } from 'effect'
import { startServer } from './app/bootstrap.ts'
import { RuntimeDir, SOCKET_PATH } from './app/runtime.ts'
import { ChromeLauncher } from './features/launch-chrome/chrome-launcher.ts'

declare const BUILD_VERSION: string

console.log(`Chroma Server Version: ${BUILD_VERSION}`)

const program = Effect.gen(function* () {
  const socketPath = yield* SOCKET_PATH
  yield* Effect.scoped(startServer(socketPath))
})

const appLayer = ChromeLauncher.wslLayer.pipe(
  Layer.provideMerge(RuntimeDir.layer),
  Layer.provideMerge(BunContext.layer),
)

BunRuntime.runMain(program.pipe(Effect.provide(appLayer)))

import { HttpRouter } from '@effect/platform'
import { BunContext, BunHttpServer, BunRuntime } from '@effect/platform-bun'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Effect, Layer as L } from 'effect'
import { ChromeRpcGroup, ChromeRpcLive } from './app/rpcs.ts'
import { SocketPath, UnixSocket } from './app/runtime.ts'
import { ChromeService } from './services/chrome-service.ts'

console.log(`Chroma Server Version: ${BUILD_VERSION}`)

const RpcServerLive = RpcServer.layer(ChromeRpcGroup).pipe(
  L.provide(ChromeRpcLive),
  L.provide(RpcServer.layerProtocolHttp({ path: '/rpc' })),
  L.provide(RpcSerialization.layerNdjson),
)

const HttpServerLive = L.unwrapScoped(
  Effect.gen(function* () {
    const socket = yield* Effect.flatMap(SocketPath, UnixSocket)
    return BunHttpServer.layerServer({ unix: socket.path })
  }),
).pipe(L.provide(SocketPath.Default))

const MainLive = HttpRouter.Default.serve().pipe(
  L.provide(RpcServerLive),
  L.provide(ChromeService.wslLayer),
  L.provide(HttpServerLive),
  L.provide(BunContext.layer),
)

BunRuntime.runMain(L.launch(MainLive))

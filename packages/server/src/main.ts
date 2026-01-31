import { HttpRouter } from '@effect/platform'
import { BunContext, BunHttpServer, BunRuntime } from '@effect/platform-bun'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Cause, Config, Effect, Exit, Layer as L, Layer, Logger, LogLevel } from 'effect'
import { LoggingMiddlewareLive } from './app/logging-middleware.ts'
import { ChromeRpcGroup, ChromeRpcLive } from './app/rpcs.ts'
import { SocketPath, UnixSocket } from './app/runtime.ts'
import { ChromeService } from './services/chrome-service.ts'

const LogLevelLive = Layer.unwrapEffect(Config.logLevel('CHROMA_LOG_LEVEL').pipe(Effect.map(Logger.minimumLogLevel)))

const RpcServerLive = RpcServer.layer(ChromeRpcGroup).pipe(
  L.provide(ChromeRpcLive),
  L.provide(LoggingMiddlewareLive),
  L.provide(RpcServer.layerProtocolHttp({ path: '/rpc' })),
  L.provide(RpcSerialization.layerNdjson),
)

const HttpServerLive = L.unwrapScoped(
  Effect.gen(function* () {
    const socket = yield* Effect.flatMap(SocketPath, UnixSocket)
    yield* Effect.logInfo('starting server on unix socket').pipe(Effect.annotateLogs({ socketPath: socket.path }))
    return BunHttpServer.layerServer({ unix: socket.path })
  }),
).pipe(L.provide(SocketPath.Default))

const MainLive = HttpRouter.Default.serve().pipe(
  L.provide(RpcServerLive),
  L.provide(ChromeService.wslLayer),
  L.provide(HttpServerLive),
  L.provide(BunContext.layer),
  L.provide(LogLevelLive),
)

const program = Effect.gen(function* () {
  yield* Effect.logInfo('start server').pipe(
    Effect.annotateLogs({
      BUILD_VERSION,
    }),
  )
  return yield* L.launch(MainLive)
})

BunRuntime.runMain(program, {
  teardown: (exit, onExit) => {
    const log = (level: LogLevel.LogLevel, ...args: ReadonlyArray<unknown>) =>
      Effect.runSync(Effect.logWithLevel(level, ...args).pipe(Effect.provide(Logger.pretty)))

    if (Exit.isSuccess(exit) || Cause.isInterruptedOnly(exit.cause)) {
      log(LogLevel.Info, 'gracefully shutting down')
      onExit(0)
    } else {
      log(LogLevel.Fatal, 'program ended with an error', exit.cause)
      onExit(1)
    }
  },
})

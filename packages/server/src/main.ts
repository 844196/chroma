import { type as osType } from 'node:os'
import { SocketPath } from '@chroma/shared/infrastructure'
import { ChromeRpcGroup } from '@chroma/shared/rpc'
import { HttpRouter } from '@effect/platform'
import { BunContext, BunHttpServer, BunRuntime } from '@effect/platform-bun'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Cause, Config, Effect, Exit, Layer as L, Layer, Logger, LogLevel } from 'effect'
import isWsl from 'is-wsl'
import { CommandExecutorLive } from './infrastructure/command-executor.ts'
import { CommandFactoryDarwinLive, CommandFactoryWslLive } from './infrastructure/command-factory.ts'
import { UnixSocket } from './infrastructure/unix-socket.ts'
import { ChromeRpcLive } from './presentation/chrome-rpc-group.ts'
import { LaunchChromeUseCase } from './use-case/launch-chrome/launch-chrome-use-case.ts'

const LogLevelLive = Layer.unwrapEffect(
  Config.logLevel('CHROMA_LOG_LEVEL').pipe(Config.withDefault(LogLevel.Info), Effect.map(Logger.minimumLogLevel)),
)

const RpcServerLive = RpcServer.layer(ChromeRpcGroup).pipe(
  L.provide(ChromeRpcLive),
  L.provide(RpcServer.layerProtocolHttp({ path: '/rpc' })),
  L.provide(RpcSerialization.layerNdjson),
)

const HttpServerLive = L.unwrapScoped(
  Effect.gen(function* () {
    const socket = yield* Effect.flatMap(SocketPath, UnixSocket)
    yield* Effect.logInfo('starting server on unix socket').pipe(Effect.annotateLogs({ socketPath: socket.path }))
    return BunHttpServer.layerServer({ unix: socket.path })
  }),
).pipe(L.provide(SocketPath.layer))

const CommandFactoryLive = L.unwrapEffect(
  Effect.gen(function* () {
    const os = osType()
    if (os === 'Darwin') {
      return CommandFactoryDarwinLive
    }
    if (isWsl) {
      return CommandFactoryWslLive
    }
    return yield* Effect.dieMessage(`unsupported OS: ${os}`)
  }),
)

const MainLive = HttpRouter.Default.serve().pipe(
  L.provide(RpcServerLive),
  L.provide(LaunchChromeUseCase.layer),
  L.provide(CommandFactoryLive),
  L.provide(CommandExecutorLive),
  L.provide(HttpServerLive),
  L.provide(BunContext.layer),
  L.provide(LogLevelLive),
)

const program = Effect.gen(function* () {
  yield* Effect.logInfo('start server').pipe(
    Effect.annotateLogs({
      BUILD_VERSION,
      BUILD_TIME,
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

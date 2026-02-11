import { type as osType } from 'node:os'
import { ConfigLive, SocketPath } from '@chroma/shared/infrastructure'
import { ChromeRpcGroup } from '@chroma/shared/rpc'
import { HttpRouter } from '@effect/platform'
import { BunContext, BunHttpServer, BunRuntime } from '@effect/platform-bun'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Cause, Config, Effect, Exit, Layer, Logger, LogLevel } from 'effect'
import isWsl from 'is-wsl'
import { LaunchChromeUseCase } from './application/launch-chrome-use-case.ts'
import { AppEnv } from './domain/app-env.ts'
import { ProfileNameResolver } from './domain/profile-name-resolver.ts'
import { CommandExecutorLive } from './infrastructure/command-executor.ts'
import { CommandFactoryDarwinLive, CommandFactoryWslLive } from './infrastructure/command-factory.ts'
import { UnixSocket } from './infrastructure/unix-socket.ts'
import { ChromeRpcGroupLive } from './presentation/chrome-rpc-group.ts'
import { ErrorMaskingMiddleware } from './presentation/error-masking-middleware.ts'
import { LoggingMiddleware } from './presentation/logging-middleware.ts'

/**
 * ログレベル設定ライブレイヤー
 */
const LogLevelLive = Layer.unwrapEffect(
  Config.logLevel('CHROMA_LOG_LEVEL').pipe(Config.withDefault(LogLevel.Info), Effect.map(Logger.minimumLogLevel)),
)

/**
 * ミドルウェア付き ChromeRpcGroup
 *
 * NOTE: ChromeRpcGroup.middleware() はランタイム実装の制約により RpcGroup<any> を返す。
 * RpcServer.layer() にミドルウェア付きグループを渡す必要があるが、型が any に汚染されるため
 * 型アサーションで元の型に戻す。ミドルウェアの実行に必要な各ミドルウェアの layer は
 * ランタイム用に Layer.provide で明示的に提供している。
 *
 * ミドルウェアチェーン: LoggingMiddleware(内側) → ErrorMaskingMiddleware(外側)
 */
const ChromeRpcGroupWithMiddleware = ChromeRpcGroup.middleware(LoggingMiddleware).middleware(
  ErrorMaskingMiddleware,
) as unknown as typeof ChromeRpcGroup

/**
 * RPCサーバーライブレイヤー
 */
const RpcServerLive = RpcServer.layer(ChromeRpcGroupWithMiddleware).pipe(
  Layer.provide(ChromeRpcGroupLive),
  Layer.provide(LoggingMiddleware.layer),
  Layer.provide(ErrorMaskingMiddleware.layer),
  Layer.provide(RpcServer.layerProtocolHttp({ path: '/rpc' })),
  Layer.provide(RpcSerialization.layerNdjson),
)

/**
 * HTTPサーバーライブレイヤー (Unix domain socket)
 */
const HttpServerLive = Layer.unwrapScoped(
  Effect.gen(function* () {
    const socket = yield* Effect.flatMap(SocketPath, UnixSocket)
    yield* Effect.logInfo('starting server on unix socket').pipe(Effect.annotateLogs({ socketPath: socket.path }))
    return BunHttpServer.layerServer({ unix: socket.path })
  }),
).pipe(Layer.provide(SocketPath.layer))

/**
 * 実行されているOSに応じたコマンドファクトリーライブレイヤー
 */
const CommandFactoryLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const os = osType()
    if (os === 'Darwin') {
      yield* Effect.logDebug('detected OS').pipe(Effect.annotateLogs({ os: 'Darwin' }))
      return CommandFactoryDarwinLive
    }
    if (isWsl) {
      yield* Effect.logDebug('detected OS').pipe(Effect.annotateLogs({ os: 'WSL' }))
      return CommandFactoryWslLive
    }
    return yield* Effect.dieMessage(`unsupported OS: ${os}`)
  }),
)

/**
 * 合成されたメインライブレイヤー
 */
const MainLive = HttpRouter.Default.serve().pipe(
  Layer.provide(RpcServerLive),
  Layer.provide(LaunchChromeUseCase.layer),
  Layer.provide(ProfileNameResolver.layer),
  Layer.provide(ConfigLive()),
  Layer.provide(CommandFactoryLive),
  Layer.provide(CommandExecutorLive),
  Layer.provide(HttpServerLive),
  Layer.provide(BunContext.layer),
  Layer.provide(LogLevelLive),
  Layer.provide(Layer.succeed(AppEnv, process.env.NODE_ENV === 'development' ? 'development' : 'production')),
)

const program = Effect.gen(function* () {
  yield* Effect.logInfo('start server').pipe(
    Effect.annotateLogs({
      BUILD_VERSION,
      BUILD_TIME,
    }),
  )
  return yield* Layer.launch(MainLive)
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

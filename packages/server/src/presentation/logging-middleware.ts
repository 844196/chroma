import { RpcMiddleware } from '@effect/rpc'
import { Effect, Layer } from 'effect'

export class LoggingMiddleware extends RpcMiddleware.Tag<LoggingMiddleware>()('LoggingMiddleware', {
  wrap: true,
}) {
  static readonly layer = Layer.succeed(
    LoggingMiddleware,
    LoggingMiddleware.of(({ rpc, next }) =>
      next.pipe(
        Effect.tapErrorCause((cause) => Effect.logError('RPC failed', cause)),
        Effect.tap(() => Effect.logInfo('RPC succeeded')),
        Effect.withLogSpan(rpc.key),
      ),
    ),
  )
}

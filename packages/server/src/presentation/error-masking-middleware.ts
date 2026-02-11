import { InternalServerError } from '@chroma/shared/rpc'
import { RpcMiddleware } from '@effect/rpc'
import { Effect, Layer } from 'effect'
import { AppEnv } from '../domain/app-env.ts'

export class ErrorMaskingMiddleware extends RpcMiddleware.Tag<ErrorMaskingMiddleware>()('ErrorMaskingMiddleware', {
  wrap: true,
  failure: InternalServerError,
}) {
  static readonly layer = Layer.effect(
    ErrorMaskingMiddleware,
    Effect.map(AppEnv, (appEnv) =>
      ErrorMaskingMiddleware.of(({ next }) =>
        appEnv === 'production' ? next.pipe(Effect.catchAllDefect(() => Effect.fail(new InternalServerError()))) : next,
      ),
    ),
  )
}

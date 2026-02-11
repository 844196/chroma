import { InternalServerError } from '@chroma/shared/rpc'
import { assert, describe, expect, it } from '@effect/vitest'
import { Cause, Effect, Exit, Layer, Option } from 'effect'
import { AppEnv } from '../domain/app-env.ts'
import { ErrorMaskingMiddleware } from './error-masking-middleware.ts'

// biome-ignore lint/suspicious/noExplicitAny: ミドルウェアの内部型はテストで直接扱う必要があるためanyキャストを使用
const callMiddleware = (middleware: any, next: Effect.Effect<unknown, unknown>) =>
  (middleware as (opts: { next: Effect.Effect<unknown, unknown> }) => Effect.Effect<void>)({ next })

describe('ErrorMaskingMiddleware', () => {
  describe('AppEnvがproductionの場合', () => {
    const testLayer = ErrorMaskingMiddleware.layer.pipe(Layer.provide(Layer.succeed(AppEnv, 'production' as const)))

    it.effect('defectがInternalServerErrorに変換されること', () =>
      Effect.gen(function* () {
        const middleware = yield* ErrorMaskingMiddleware
        const result = yield* Effect.exit(callMiddleware(middleware, Effect.die('secret')))

        expect(Exit.isFailure(result)).toBe(true)
        assert(Exit.isFailure(result))

        const failure = Cause.failureOption(result.cause)
        expect(Option.isSome(failure)).toBe(true)
        assert(Option.isSome(failure))

        expect(failure.value).toBeInstanceOf(InternalServerError)
      }).pipe(Effect.provide(testLayer)),
    )

    it.effect('通常のエラーはそのまま伝播すること', () =>
      Effect.gen(function* () {
        const middleware = yield* ErrorMaskingMiddleware
        const result = yield* Effect.exit(callMiddleware(middleware, Effect.fail(new InternalServerError())))

        expect(Exit.isFailure(result)).toBe(true)
        assert(Exit.isFailure(result))

        const failure = Cause.failureOption(result.cause)
        expect(Option.isSome(failure)).toBe(true)
        assert(Option.isSome(failure))

        expect(failure.value).toBeInstanceOf(InternalServerError)
      }).pipe(Effect.provide(testLayer)),
    )

    it.effect('成功はそのまま伝播すること', () =>
      Effect.gen(function* () {
        const middleware = yield* ErrorMaskingMiddleware
        const result = yield* Effect.exit(callMiddleware(middleware, Effect.void))

        expect(Exit.isSuccess(result)).toBe(true)
      }).pipe(Effect.provide(testLayer)),
    )
  })

  describe('AppEnvがdevelopmentの場合', () => {
    const testLayer = ErrorMaskingMiddleware.layer.pipe(Layer.provide(Layer.succeed(AppEnv, 'development' as const)))

    it.effect('defectがそのまま伝播すること', () =>
      Effect.gen(function* () {
        const middleware = yield* ErrorMaskingMiddleware
        const result = yield* Effect.exit(callMiddleware(middleware, Effect.die('secret')))

        expect(Exit.isFailure(result)).toBe(true)
        assert(Exit.isFailure(result))

        expect(Cause.isDie(result.cause)).toBe(true)

        const defect = Cause.dieOption(result.cause)
        expect(Option.isSome(defect)).toBe(true)
        assert(Option.isSome(defect))

        expect(defect.value).toBe('secret')
      }).pipe(Effect.provide(testLayer)),
    )
  })
})

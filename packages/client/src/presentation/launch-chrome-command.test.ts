import { ChromeLaunchError, InvalidProfileNameError } from '@chroma/shared/domain'
import { InternalServerError } from '@chroma/shared/rpc'
import { RpcClientError } from '@effect/rpc'
import { assert, describe, expect, it } from '@effect/vitest'
import { Cause, Effect, Exit, Layer, Option } from 'effect'
import { LaunchChromeUseCase } from '../application/launch-chrome-use-case.ts'
import { LaunchChromeCommand, LaunchChromeCommandError } from './launch-chrome-command.ts'

type UseCaseError = ChromeLaunchError | InvalidProfileNameError | InternalServerError | RpcClientError.RpcClientError

const createMockUseCase = (
  invoke: (
    profileName: Option.Option<string>,
    url: Option.Option<string>,
    cwd: string,
  ) => Effect.Effect<void, UseCaseError>,
) => Layer.succeed(LaunchChromeUseCase, { invoke })

const buildTestLayer = (mockUseCase: Layer.Layer<LaunchChromeUseCase>) =>
  LaunchChromeCommand.layer.pipe(Layer.provide(mockUseCase))

const runCommand = Effect.gen(function* () {
  const cmd = yield* LaunchChromeCommand
  return yield* Effect.exit(cmd.run(Option.some('test'), Option.none(), '/tmp'))
})

const extractFailure = (result: Exit.Exit<void, LaunchChromeCommandError>) => {
  expect(Exit.isFailure(result)).toBe(true)
  assert(Exit.isFailure(result))
  const cause = Cause.failureOption(result.cause)
  expect(Option.isSome(cause)).toBe(true)
  assert(Option.isSome(cause))
  return cause.value
}

describe('LaunchChromeCommand', () => {
  describe('run', () => {
    it.effect('成功時はエラーなく完了すること', () => {
      const testLayer = buildTestLayer(createMockUseCase(() => Effect.void))

      return Effect.gen(function* () {
        const cmd = yield* LaunchChromeCommand
        const result = yield* Effect.exit(cmd.run(Option.some('work'), Option.some('https://example.com'), '/tmp'))
        expect(Exit.isSuccess(result)).toBe(true)
      }).pipe(Effect.provide(testLayer))
    })

    describe('InvalidProfileNameError の場合', () => {
      it.effect('メッセージにgivenNameが含まれること', () => {
        const originalError = new InvalidProfileNameError({ givenName: 'bad-profile' })
        const testLayer = buildTestLayer(createMockUseCase(() => Effect.fail(originalError)))

        return Effect.gen(function* () {
          const error = extractFailure(yield* runCommand)
          expect(error).toBeInstanceOf(LaunchChromeCommandError)
          expect(error.message).toBe("invalid profile name -- 'bad-profile'")
          expect(error.cause).toStrictEqual(originalError)
        }).pipe(Effect.provide(testLayer))
      })
    })

    describe('ChromeLaunchError の場合', () => {
      it.effect('stderrがある場合、終了コードとstderrがすべてメッセージに含まれること', () => {
        const originalError = new ChromeLaunchError({
          exitCode: 1,
          stdout: '',
          stderr: 'first line\nsecond line',
        })
        const testLayer = buildTestLayer(createMockUseCase(() => Effect.fail(originalError)))

        return Effect.gen(function* () {
          const error = extractFailure(yield* runCommand)
          expect(error).toBeInstanceOf(LaunchChromeCommandError)
          expect(error.message).toBe('chrome exited with code 1: first line\nsecond line')
          expect(error.cause).toStrictEqual(originalError)
        }).pipe(Effect.provide(testLayer))
      })

      it.effect('stderrが空の場合、終了コードのみがメッセージに含まれること', () => {
        const originalError = new ChromeLaunchError({
          exitCode: 2,
          stdout: '',
          stderr: '',
        })
        const testLayer = buildTestLayer(createMockUseCase(() => Effect.fail(originalError)))

        return Effect.gen(function* () {
          const error = extractFailure(yield* runCommand)
          expect(error).toBeInstanceOf(LaunchChromeCommandError)
          expect(error.message).toBe('chrome exited with code 2')
          expect(error.cause).toStrictEqual(originalError)
        }).pipe(Effect.provide(testLayer))
      })
    })

    describe('InternalServerError の場合', () => {
      it.effect('固定メッセージであること', () => {
        const originalError = new InternalServerError()
        const testLayer = buildTestLayer(createMockUseCase(() => Effect.fail(originalError)))

        return Effect.gen(function* () {
          const error = extractFailure(yield* runCommand)
          expect(error).toBeInstanceOf(LaunchChromeCommandError)
          expect(error.message).toBe('an internal server error has occurred.')
          expect(error.cause).toStrictEqual(originalError)
        }).pipe(Effect.provide(testLayer))
      })
    })

    describe('RpcClientError の場合', () => {
      it.effect('reasonがUnknownの場合、メッセージにreasonが含まれること', () => {
        const originalError = new RpcClientError.RpcClientError({ reason: 'Unknown', message: 'connection refused' })
        const testLayer = buildTestLayer(createMockUseCase(() => Effect.fail(originalError)))

        return Effect.gen(function* () {
          const error = extractFailure(yield* runCommand)
          expect(error).toBeInstanceOf(LaunchChromeCommandError)
          expect(error.message).toBe('could not connect to daemon. (reason: Unknown)')
          expect(error.cause).toStrictEqual(originalError)
        }).pipe(Effect.provide(testLayer))
      })

      it.effect('reasonがProtocolの場合、メッセージにreasonが含まれること', () => {
        const originalError = new RpcClientError.RpcClientError({ reason: 'Protocol', message: 'protocol error' })
        const testLayer = buildTestLayer(createMockUseCase(() => Effect.fail(originalError)))

        return Effect.gen(function* () {
          const error = extractFailure(yield* runCommand)
          expect(error).toBeInstanceOf(LaunchChromeCommandError)
          expect(error.message).toBe('could not connect to daemon. (reason: Protocol)')
          expect(error.cause).toStrictEqual(originalError)
        }).pipe(Effect.provide(testLayer))
      })
    })
  })
})

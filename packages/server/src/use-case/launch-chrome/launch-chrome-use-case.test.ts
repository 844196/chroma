import { ProfileName } from '@chroma/shared/domain'
import { Command } from '@effect/platform'
import { assert, describe, expect, it } from '@effect/vitest'
import { Cause, Effect, Exit, Layer, Option, Schema } from 'effect'
import { CommandExecutor, CommandFailedError } from './command-executor.ts'
import { CommandFactory } from './command-factory.ts'
import { LaunchChromeUseCase } from './launch-chrome-use-case.ts'

const profileName = Schema.decodeSync(ProfileName)('Default')

describe('LaunchChromeUseCase', () => {
  describe('invoke', () => {
    it.effect('CommandFactoryでコマンドを生成し、CommandExecutorで実行して成功した場合、成功とみなされること', () => {
      const dummyCmd = Command.make('dummy')

      const mockFactory = Layer.succeed(CommandFactory, {
        create: () => Effect.succeed(dummyCmd),
      })
      const mockExecutor = Layer.succeed(CommandExecutor, {
        exec: () => Effect.void,
      })
      const testLayer = LaunchChromeUseCase.layer.pipe(Layer.provide(Layer.merge(mockFactory, mockExecutor)))

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        const result = yield* Effect.exit(useCase.invoke(Option.some(profileName), Option.some('https://example.com')))

        expect(Exit.isSuccess(result)).toBe(true)
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('CommandExecutorがCommandFailedErrorで失敗した場合、そのまま伝搬されること', () => {
      const dummyCmd = Command.make('dummy')

      const mockFactory = Layer.succeed(CommandFactory, {
        create: () => Effect.succeed(dummyCmd),
      })
      const mockExecutor = Layer.succeed(CommandExecutor, {
        exec: () => Effect.fail(new CommandFailedError({ exitCode: 1, stdout: 'out', stderr: 'err' })),
      })
      const testLayer = LaunchChromeUseCase.layer.pipe(Layer.provide(Layer.merge(mockFactory, mockExecutor)))

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        const result = yield* Effect.exit(useCase.invoke(Option.none(), Option.none()))
        expect(Exit.isFailure(result)).toBe(true)
        assert(Exit.isFailure(result))

        const cause = Cause.failureOption(result.cause)
        expect(Option.isSome(cause)).toBe(true)
        assert(Option.isSome(cause))

        expect(cause.value).toBeInstanceOf(CommandFailedError)
        expect(cause.value.exitCode).toBe(1)
        expect(cause.value.stdout).toBe('out')
        expect(cause.value.stderr).toBe('err')
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('CommandFactoryで生成されたコマンドがCommandExecutorに渡されること', () => {
      const dummyCmd = Command.make('specific-command', '--flag')
      let executedCmd = Command.make('sentinel')

      const mockFactory = Layer.succeed(CommandFactory, {
        create: () => Effect.succeed(dummyCmd),
      })
      const mockExecutor = Layer.succeed(CommandExecutor, {
        exec: (cmd) => {
          executedCmd = cmd
          return Effect.void
        },
      })
      const testLayer = LaunchChromeUseCase.layer.pipe(Layer.provide(Layer.merge(mockFactory, mockExecutor)))

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        yield* useCase.invoke(Option.none(), Option.none())

        expect(executedCmd.toJSON()).toEqual(dummyCmd.toJSON())
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('CommandFactoryにprofileNameとurlが正しく渡されること', () => {
      let receivedProfileName: Option.Option<ProfileName> = Option.none()
      let receivedUrl: Option.Option<string> = Option.none()

      const mockFactory = Layer.succeed(CommandFactory, {
        create: (pn, u) => {
          receivedProfileName = pn
          receivedUrl = u
          return Effect.succeed(Command.make('dummy'))
        },
      })
      const mockExecutor = Layer.succeed(CommandExecutor, {
        exec: () => Effect.void,
      })
      const testLayer = LaunchChromeUseCase.layer.pipe(Layer.provide(Layer.merge(mockFactory, mockExecutor)))

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        yield* useCase.invoke(Option.some(profileName), Option.some('https://example.com'))

        expect(Option.isSome(receivedProfileName)).toBe(true)
        assert(Option.isSome(receivedProfileName))
        expect(receivedProfileName.value).toBe(profileName)

        expect(Option.isSome(receivedUrl)).toBe(true)
        assert(Option.isSome(receivedUrl))
        expect(receivedUrl.value).toBe('https://example.com')
      }).pipe(Effect.provide(testLayer))
    })
  })
})

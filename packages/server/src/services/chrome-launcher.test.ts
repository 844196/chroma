import { ChromeLaunchError } from '@chroma/shared/errors'
import { Command, CommandExecutor } from '@effect/platform'
import { ExitCode, ProcessId, ProcessTypeId, TypeId } from '@effect/platform/CommandExecutor'
import { SystemError } from '@effect/platform/Error'
import { assert, describe, expect, it } from '@effect/vitest'
import { Cause, Effect, Exit, Layer, Option, Sink, Stream } from 'effect'
import { NodeInspectSymbol } from 'effect/Inspectable'
import { ChromeLauncher } from './chrome-launcher.ts'

const createProcess = (opts: {
  exitCode: CommandExecutor.ExitCode
  stdout?: Stream.Stream<Uint8Array>
  stderr?: Stream.Stream<Uint8Array>
}): CommandExecutor.Process => ({
  [ProcessTypeId]: ProcessTypeId,
  [NodeInspectSymbol]: () => '',
  exitCode: Effect.succeed(opts.exitCode),
  isRunning: Effect.succeed(false),
  pid: ProcessId(1234),
  stdin: Sink.succeed(undefined),
  stdout: opts.stdout ?? Stream.empty,
  stderr: opts.stderr ?? Stream.empty,
  kill: () => Effect.void,
  toJSON: () => null,
  toString: () => '',
})

describe('ChromeLauncher', () => {
  describe('launch', () => {
    it.effect('should succeed when command exits with code 0', () => {
      const mockExecutor = Layer.mock(CommandExecutor.CommandExecutor, {
        [TypeId]: TypeId,
        start: () => Effect.succeed(createProcess({ exitCode: ExitCode(0) })),
      })
      const testLayer = ChromeLauncher.layer.pipe(Layer.provide(mockExecutor))

      return Effect.gen(function* () {
        const launcher = yield* ChromeLauncher

        const cmd = Command.make('echo', 'hello')
        const result = yield* Effect.exit(launcher.launch(cmd))

        expect(Exit.isSuccess(result)).toBe(true)
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('should fail with ChromeLaunchError when command exits with non-zero code', () => {
      const mockExecutor = Layer.mock(CommandExecutor.CommandExecutor, {
        [TypeId]: TypeId,
        start: () =>
          Effect.succeed(
            createProcess({
              exitCode: ExitCode(1),
              stdout: Stream.make(new TextEncoder().encode('stdout output')),
              stderr: Stream.make(new TextEncoder().encode('stderr output')),
            }),
          ),
      })
      const testLayer = ChromeLauncher.layer.pipe(Layer.provide(mockExecutor))

      return Effect.gen(function* () {
        const launcher = yield* ChromeLauncher

        const cmd = Command.make('false')

        const result = yield* Effect.exit(launcher.launch(cmd))
        expect(Exit.isFailure(result)).toBe(true)
        assert(Exit.isFailure(result))

        const cause = Cause.failureOption(result.cause)
        expect(Option.isSome(cause)).toBe(true)
        assert(Option.isSome(cause))

        expect(cause.value).toBeInstanceOf(ChromeLaunchError)
        expect(cause.value.exitCode).toBe(1)
        expect(cause.value.stdout).toBe('stdout output')
        expect(cause.value.stderr).toBe('stderr output')
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('should die when executor fails unexpectedly', () => {
      const mockExecutor = Layer.mock(CommandExecutor.CommandExecutor, {
        [TypeId]: TypeId,
        start: () => Effect.fail(new SystemError({ reason: 'Unknown', module: 'Command', method: 'start' })),
      })
      const testLayer = ChromeLauncher.layer.pipe(Layer.provide(mockExecutor))

      return Effect.gen(function* () {
        const launcher = yield* ChromeLauncher

        const cmd = Command.make('echo', 'hello')

        const result = yield* Effect.exit(launcher.launch(cmd))
        expect(Exit.isFailure(result)).toBe(true)
        assert(Exit.isFailure(result))

        expect(Cause.isDie(result.cause)).toBe(true)
      }).pipe(Effect.provide(testLayer))
    })
  })
})

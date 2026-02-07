import { Command, CommandExecutor as PlatformCommandExecutor } from '@effect/platform'
import { ExitCode, ProcessId, ProcessTypeId, TypeId } from '@effect/platform/CommandExecutor'
import { SystemError } from '@effect/platform/Error'
import { assert, describe, expect, it } from '@effect/vitest'
import { Cause, Effect, Exit, Layer, Option, Sink, Stream } from 'effect'
import { NodeInspectSymbol } from 'effect/Inspectable'
import { CommandExecutor, CommandFailedError } from './command-executor.ts'

const createProcess = (opts: {
  exitCode: PlatformCommandExecutor.ExitCode
  stdout?: Stream.Stream<Uint8Array>
  stderr?: Stream.Stream<Uint8Array>
}): PlatformCommandExecutor.Process => ({
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

describe('CommandExecutor', () => {
  describe('exec', () => {
    it.effect('Chrome起動コマンドが終了コード0で終了した場合、成功とみなされること', () => {
      const mockExecutor = Layer.mock(PlatformCommandExecutor.CommandExecutor, {
        [TypeId]: TypeId,
        start: () => Effect.succeed(createProcess({ exitCode: ExitCode(0) })),
      })
      const testLayer = CommandExecutor.layer.pipe(Layer.provide(mockExecutor))

      return Effect.gen(function* () {
        const executor = yield* CommandExecutor

        const cmd = Command.make('chrome', 'https://example.com')
        const result = yield* Effect.exit(executor.exec(cmd))

        expect(Exit.isSuccess(result)).toBe(true)
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('Chrome起動コマンドが終了コード非0で終了した場合、失敗とみなされること', () => {
      const mockExecutor = Layer.mock(PlatformCommandExecutor.CommandExecutor, {
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
      const testLayer = CommandExecutor.layer.pipe(Layer.provide(mockExecutor))

      return Effect.gen(function* () {
        const executor = yield* CommandExecutor

        const cmd = Command.make('chrome', 'https://example.com')

        const result = yield* Effect.exit(executor.exec(cmd))
        expect(Exit.isFailure(result)).toBe(true)
        assert(Exit.isFailure(result))

        const cause = Cause.failureOption(result.cause)
        expect(Option.isSome(cause)).toBe(true)
        assert(Option.isSome(cause))

        expect(cause.value).toBeInstanceOf(CommandFailedError)
        expect(cause.value.exitCode).toBe(1)
        expect(cause.value.stdout).toBe('stdout output')
        expect(cause.value.stderr).toBe('stderr output')
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('Chrome起動コマンドの実行自体に失敗した場合、dieとみなされること', () => {
      const mockExecutor = Layer.mock(PlatformCommandExecutor.CommandExecutor, {
        [TypeId]: TypeId,
        start: () => Effect.fail(new SystemError({ reason: 'Unknown', module: 'Command', method: 'start' })),
      })
      const testLayer = CommandExecutor.layer.pipe(Layer.provide(mockExecutor))

      return Effect.gen(function* () {
        const executor = yield* CommandExecutor

        const cmd = Command.make('chrome', 'https://example.com')

        const result = yield* Effect.exit(executor.exec(cmd))
        expect(Exit.isFailure(result)).toBe(true)
        assert(Exit.isFailure(result))

        expect(Cause.isDie(result.cause)).toBe(true)
      }).pipe(Effect.provide(testLayer))
    })
  })
})

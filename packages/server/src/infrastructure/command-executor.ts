import { type Command, CommandExecutor as PlatformCommandExecutor } from '@effect/platform'
import { Effect, String as EffectString, Layer, pipe, Stream } from 'effect'
import { CommandExecutor, CommandFailedError } from '../domain/command-executor.ts'

export const CommandExecutorLive = Layer.effect(
  CommandExecutor,
  Effect.gen(function* () {
    const platformCommandExecutor = yield* PlatformCommandExecutor.CommandExecutor

    const exec = Effect.fn('CommandExecutor.exec')(function* (cmd: Command.Command) {
      yield* Effect.logDebug('executing command')

      const run = pipe(
        platformCommandExecutor.start(cmd),
        Effect.flatMap(({ exitCode, stdout, stderr }) =>
          Effect.all([exitCode, decodeStream(stdout), decodeStream(stderr)], { concurrency: 3 }),
        ),
        Effect.tap(([exitCode, stdout, stderr]) =>
          Effect.logDebug('command finished').pipe(Effect.annotateLogs({ exitCode, stdout, stderr })),
        ),
        Effect.catchAll(Effect.die),
        Effect.filterOrFail(
          ([exitCode]) => exitCode === 0,
          ([exitCode, stdout, stderr]) => new CommandFailedError({ exitCode, stdout, stderr }),
        ),
      )

      yield* Effect.scoped(run)
    })

    return { exec }
  }),
)

function decodeStream<E, R>(stream: Stream.Stream<Uint8Array, E, R>): Effect.Effect<string, E, R> {
  return stream.pipe(Stream.decodeText(), Stream.runFold(EffectString.empty, EffectString.concat))
}

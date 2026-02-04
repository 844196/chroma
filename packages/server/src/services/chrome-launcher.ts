import { ChromeLaunchError } from '@chroma/shared/errors'
import { type Command, CommandExecutor } from '@effect/platform'
import { Context, Effect, String as EffectString, Layer, pipe, Stream } from 'effect'

export class ChromeLauncher extends Context.Tag('@chroma/server/services/ChromeLauncher')<
  ChromeLauncher,
  {
    readonly launch: (cmd: Command.Command) => Effect.Effect<void, ChromeLaunchError>
  }
>() {
  static readonly layer = Layer.effect(
    ChromeLauncher,
    Effect.gen(function* () {
      const executor = yield* CommandExecutor.CommandExecutor

      const launch = Effect.fn('ChromeLauncher.launch')(function* (cmd: Command.Command) {
        const run = pipe(
          executor.start(cmd),
          Effect.flatMap(({ exitCode, stdout, stderr }) =>
            Effect.all([exitCode, decodeStream(stdout), decodeStream(stderr)], { concurrency: 3 }),
          ),
          Effect.catchAll(Effect.die),
          Effect.filterOrFail(
            ([exitCode]) => exitCode === 0,
            ([exitCode, stdout, stderr]) => new ChromeLaunchError({ exitCode, stdout, stderr }),
          ),
        )

        yield* Effect.scoped(run)
      })

      return { launch }
    }),
  )
}

function decodeStream<E, R>(stream: Stream.Stream<Uint8Array, E, R>): Effect.Effect<string, E, R> {
  return stream.pipe(Stream.decodeText(), Stream.runFold(EffectString.empty, EffectString.concat))
}

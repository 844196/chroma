import { Command, CommandExecutor } from '@effect/platform'
import { Context, Effect, String as EffectString, Layer, Option, pipe, Schema, Stream } from 'effect'
import type { ProfileName } from '../schemas/profile-name'

export class ChromeService extends Context.Tag('@chroma/server/services/ChromeService')<
  ChromeService,
  {
    readonly launch: (
      profileName: Option.Option<ProfileName>,
      args: ReadonlyArray<string>,
    ) => Effect.Effect<void, ChromeLaunchError>
  }
>() {
  static readonly wslLayer = Layer.effect(
    ChromeService,
    Effect.gen(function* () {
      const executor = yield* CommandExecutor.CommandExecutor

      const launch = Effect.fn('ChromeService.wsl.launch')(function* (
        profileName: Option.Option<ProfileName>,
        args: ReadonlyArray<string>,
      ) {
        const formattedArgs = [...args]
        if (Option.isSome(profileName)) {
          formattedArgs.push(`--profile-directory="""${profileName.value}"""`)
        }

        const cmd = Command.make(
          '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
          'Start-Process',
          '-FilePath chrome',
          `-ArgumentList ${formattedArgs.join(', ')}`,
        )

        const run = pipe(
          executor.start(cmd),
          Effect.flatMap((r) => Effect.all([r.exitCode, Effect.succeed(r.stdout), Effect.succeed(r.stderr)])),
          Effect.filterOrElse(
            ([exitCode]) => exitCode !== 0,
            ([exitCode, stdoutStream, stderrStream]) =>
              Effect.gen(function* () {
                const [stdout, stderr] = yield* Effect.all([decodeStream(stdoutStream), decodeStream(stderrStream)], {
                  concurrency: 2,
                })
                return new ChromeLaunchError({ exitCode, stdout, stderr })
              }),
          ),
          Effect.catchAll(Effect.die),
        )

        yield* Effect.scoped(run)
      })

      return { launch }
    }),
  )
}

export class ChromeLaunchError extends Schema.TaggedError<ChromeLaunchError>()('ChromeLaunchError', {
  exitCode: Schema.Number.pipe(Schema.int()),
  stdout: Schema.String,
  stderr: Schema.String,
}) {}

function decodeStream<E, R>(stream: Stream.Stream<Uint8Array, E, R>): Effect.Effect<string, E, R> {
  return stream.pipe(Stream.decodeText(), Stream.runFold(EffectString.empty, EffectString.concat))
}

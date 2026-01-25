import { Command, type CommandExecutor } from '@effect/platform'
import { Context, Effect, String as EffectString, Layer, Option, pipe, Schema, type Scope, Stream } from 'effect'
import type { ProfileName } from '../../schemas/profile-name'

const runString = <E, R>(stream: Stream.Stream<Uint8Array, E, R>): Effect.Effect<string, E, R> =>
  stream.pipe(Stream.decodeText(), Stream.runFold(EffectString.empty, EffectString.concat))

export class ChromeLauncher extends Context.Tag('ChromeLauncher')<
  ChromeLauncher,
  (
    profileName: Option.Option<ProfileName>,
    args: ReadonlyArray<string>,
  ) => Effect.Effect<void, ChromeLaunchError, CommandExecutor.CommandExecutor | Scope.Scope>
>() {
  static readonly wslLayer = Layer.succeed(
    ChromeLauncher,
    Effect.fn('ChromeLauncher.wsl')(function* (profileName, args) {
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

      yield* pipe(
        Command.start(cmd),
        Effect.flatMap(({ exitCode, stdout, stderr }) =>
          Effect.all([exitCode, runString(stdout), runString(stderr)], { concurrency: 3 }),
        ),
        Effect.flatMap(([exitCode, stdout, stderr]) =>
          exitCode === 0 ? Effect.void : Effect.fail(new ChromeLaunchError({ exitCode, stdout, stderr })),
        ),
        Effect.catchTags({
          BadArgument: (e) => Effect.dieMessage(e.message),
          SystemError: (e) => Effect.dieMessage(e.message),
        }),
      )
    }),
  )
}

export class ChromeLaunchError extends Schema.TaggedError<ChromeLaunchError>()('ChromeLaunchError', {
  exitCode: Schema.Number.pipe(Schema.int()),
  stdout: Schema.String,
  stderr: Schema.String,
}) {}

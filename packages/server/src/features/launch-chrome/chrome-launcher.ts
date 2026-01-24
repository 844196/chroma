import { Context, Effect, Layer, type Option, Schema } from 'effect'
import type { ProfileName } from '../../schemas/profile-name'

export class ChromeLaunchError extends Schema.TaggedError<ChromeLaunchError>()('ChromeLaunchError', {
  exitCode: Schema.Number.pipe(Schema.int()),
  stdout: Schema.String,
  stderr: Schema.String,
}) {}

export class ChromeLauncher extends Context.Tag('ChromeLauncher')<
  ChromeLauncher,
  (profileName: Option.Option<ProfileName>, args: ReadonlyArray<string>) => Effect.Effect<void, ChromeLaunchError>
>() {
  static readonly layer = Layer.succeed(
    ChromeLauncher,
    ChromeLauncher.of(() =>
      Effect.fail(
        ChromeLaunchError.make({
          exitCode: 1,
          stdout: '',
          stderr: 'Not implemented.',
        }),
      ),
    ),
  )
}

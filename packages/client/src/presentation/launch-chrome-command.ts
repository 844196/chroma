import { Context, Effect, Layer, type Option, Schema } from 'effect'
import { LaunchChromeUseCase } from '../application/launch-chrome-use-case.ts'

export class LaunchChromeCommandError extends Schema.TaggedError<LaunchChromeCommandError>()(
  'LaunchChromeCommandError',
  {
    message: Schema.String,
    cause: Schema.Defect,
  },
) {}

/**
 * Chrome起動コマンド
 *
 * CLIから受け取ったプロファイル名とURLをユースケースに委譲する
 */
export class LaunchChromeCommand extends Context.Tag('@chroma/client/presentation/LaunchChromeCommand')<
  LaunchChromeCommand,
  {
    readonly run: (
      profile: Option.Option<string>,
      url: Option.Option<string>,
      cwd: string,
    ) => Effect.Effect<void, LaunchChromeCommandError>
  }
>() {
  static readonly layer = Layer.effect(
    LaunchChromeCommand,
    Effect.gen(function* () {
      const launchChromeUseCase = yield* LaunchChromeUseCase

      const run = Effect.fn('LaunchChromeCommand.run')(function* (
        profile: Option.Option<string>,
        url: Option.Option<string>,
        cwd: string,
      ) {
        yield* launchChromeUseCase.invoke(profile, url, cwd).pipe(
          Effect.catchTags({
            InvalidProfileNameError: (error) =>
              Effect.fail(
                new LaunchChromeCommandError({
                  message: `invalid profile name -- '${error.givenName}'`,
                  cause: error,
                }),
              ),
            ChromeLaunchError: (error) => {
              const detail = error.stderr.trim()
              return Effect.fail(
                new LaunchChromeCommandError({
                  message:
                    detail.length > 0
                      ? `chrome exited with code ${error.exitCode}: ${detail}`
                      : `chrome exited with code ${error.exitCode}`,
                  cause: error,
                }),
              )
            },
            InternalServerError: (error) =>
              Effect.fail(
                new LaunchChromeCommandError({
                  message: 'an internal server error has occurred.',
                  cause: error,
                }),
              ),
            RpcClientError: (error) =>
              Effect.fail(
                new LaunchChromeCommandError({
                  message: `could not connect to daemon. (reason: ${error.reason})`,
                  cause: error,
                }),
              ),
          }),
        )
      })

      return { run }
    }),
  )
}

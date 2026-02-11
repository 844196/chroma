import { Context, Effect, Layer, Match, type Option, Schema } from 'effect'
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
          Effect.mapError((error) =>
            Match.value(error).pipe(
              Match.tag(
                'InvalidProfileNameError',
                (e) =>
                  new LaunchChromeCommandError({
                    message: `invalid profile name -- '${e.givenName}'`,
                    cause: e,
                  }),
              ),
              Match.tag('ChromeLaunchError', (e) => {
                const detail = e.stderr.trim()
                return new LaunchChromeCommandError({
                  message:
                    detail.length > 0
                      ? `chrome exited with code ${e.exitCode}: ${detail}`
                      : `chrome exited with code ${e.exitCode}`,
                  cause: e,
                })
              }),
              Match.tag(
                'InternalServerError',
                (e) =>
                  new LaunchChromeCommandError({
                    message: 'an internal server error has occurred.',
                    cause: e,
                  }),
              ),
              Match.tag(
                'RpcClientError',
                (e) =>
                  new LaunchChromeCommandError({
                    message: `could not connect to daemon. (reason: ${e.reason})`,
                    cause: e,
                  }),
              ),
              Match.exhaustive,
            ),
          ),
        )
      })

      return { run }
    }),
  )
}

import type { ChromeLaunchError, InvalidProfileNameError } from '@chroma/shared/domain'
import type { InternalServerError } from '@chroma/shared/rpc'
import type { RpcClientError } from '@effect/rpc'
import { Context, Effect, Layer, type Option } from 'effect'
import { LaunchChromeUseCase } from '../application/launch-chrome-use-case.ts'

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
    ) => Effect.Effect<
      void,
      ChromeLaunchError | InvalidProfileNameError | InternalServerError | RpcClientError.RpcClientError
    >
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
        yield* launchChromeUseCase.invoke(profile, url, cwd)
      })

      return { run }
    }),
  )
}

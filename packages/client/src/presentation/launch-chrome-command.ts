import type { ChromeLaunchError } from '@chroma/shared/errors'
import type { RpcClientError } from '@effect/rpc'
import { Context, Effect, Layer, type Option } from 'effect'
import type { InvalidProfileNameError } from '../domain/profile-name-resolver.ts'
import { LaunchChromeUseCase } from '../use-case/launch-chrome/launch-chrome-use-case.ts'

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
    ) => Effect.Effect<void, ChromeLaunchError | InvalidProfileNameError | RpcClientError.RpcClientError>
  }
>() {
  static readonly layer = Layer.effect(
    LaunchChromeCommand,
    Effect.gen(function* () {
      const launchChromeUseCase = yield* LaunchChromeUseCase

      const run = Effect.fn('LaunchChromeCommand.run')(function* (
        profile: Option.Option<string>,
        url: Option.Option<string>,
      ) {
        yield* launchChromeUseCase.invoke(profile, url)
      })

      return { run }
    }),
  )
}

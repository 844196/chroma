import type { ChromeLaunchError } from '@chroma/shared/rpc'
import type { RpcClientError } from '@effect/rpc'
import { Context, Effect, Layer, type Option } from 'effect'
import { type InvalidProfileNameError, ProfileNameResolver } from '../../domain/profile-name-resolver.ts'
import { ChromeClient } from '../../infrastructure/chrome-client.ts'

/**
 * Chromeを起動するユースケース
 *
 * プロファイル名の解決を行い、サーバーにChrome起動をリクエストする
 *
 * @see {@link ProfileNameResolver} プロファイル名の解決
 * @see {@link ChromeClient} サーバーへのRPCリクエスト
 */
export class LaunchChromeUseCase extends Context.Tag('@chroma/client/use-case/launch-chrome/LaunchChromeUseCase')<
  LaunchChromeUseCase,
  {
    /**
     * Chromeの起動をサーバーにリクエストする
     *
     * - プロファイル名が指定された場合、エイリアス解決を経てサーバーに送信する
     * - プロファイル名が指定されなかった場合、サーバー側の挙動に委ねる
     */
    readonly invoke: (
      profileName: Option.Option<string>,
      url: Option.Option<string>,
    ) => Effect.Effect<void, ChromeLaunchError | InvalidProfileNameError | RpcClientError.RpcClientError>
  }
>() {
  static readonly layer = Layer.effect(
    LaunchChromeUseCase,
    Effect.gen(function* () {
      const profileNameResolver = yield* ProfileNameResolver
      const chrome = yield* ChromeClient

      const invoke = Effect.fn('LaunchChromeUseCase.invoke')(function* (
        givenProfileName: Option.Option<string>,
        url: Option.Option<string>,
      ) {
        const profileName = yield* Effect.transposeMapOption(givenProfileName, profileNameResolver.resolve)

        yield* chrome.launch({ profileName, url })
      })

      return { invoke }
    }),
  )
}

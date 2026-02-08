import type { ChromeLaunchError, InvalidProfileNameError } from '@chroma/shared/domain'
import type { RpcClientError } from '@effect/rpc'
import { Context, Effect, Layer, type Option } from 'effect'
import { ChromeClient } from '../domain/chrome-client.ts'

/**
 * Chromeを起動するユースケース
 *
 * ユーザー入力をそのままサーバーに転送し、Chrome起動をリクエストする
 *
 * @see {@link ChromeClient} サーバーへのRPCリクエスト
 */
export class LaunchChromeUseCase extends Context.Tag('@chroma/client/application/LaunchChromeUseCase')<
  LaunchChromeUseCase,
  {
    /**
     * Chromeの起動をサーバーにリクエストする
     *
     * - プロファイル名が指定された場合、そのままサーバーに送信する（エイリアス解決はサーバー側で行われる）
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
      const chrome = yield* ChromeClient

      const invoke = Effect.fn('LaunchChromeUseCase.invoke')(function* (
        givenProfileName: Option.Option<string>,
        url: Option.Option<string>,
      ) {
        yield* chrome.launch({ profileName: givenProfileName, url })
      })

      return { invoke }
    }),
  )
}

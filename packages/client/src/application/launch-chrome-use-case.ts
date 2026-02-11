import type { ChromeLaunchError, InvalidProfileNameError } from '@chroma/shared/domain'
import type { InternalServerError } from '@chroma/shared/rpc'
import type { RpcClientError } from '@effect/rpc'
import { Context, Effect, Layer, Option } from 'effect'
import { ChromeClient } from '../domain/chrome-client.ts'
import { CwdProfileResolver } from '../domain/cwd-profile-resolver.ts'

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
     * - プロファイル名が明示指定された場合、そのままサーバーに送信する（エイリアス解決はサーバー側で行われる）
     * - プロファイル名が未指定の場合、cwdに基づくpaths設定でフォールバック解決を試みる
     * - いずれにも該当しない場合、サーバー側の挙動に委ねる
     */
    readonly invoke: (
      profileName: Option.Option<string>,
      url: Option.Option<string>,
      cwd: string,
    ) => Effect.Effect<
      void,
      ChromeLaunchError | InvalidProfileNameError | InternalServerError | RpcClientError.RpcClientError
    >
  }
>() {
  static readonly layer = Layer.effect(
    LaunchChromeUseCase,
    Effect.gen(function* () {
      const chrome = yield* ChromeClient
      const cwdProfileResolver = yield* CwdProfileResolver

      const invoke = Effect.fn('LaunchChromeUseCase.invoke')(function* (
        givenProfileName: Option.Option<string>,
        url: Option.Option<string>,
        cwd: string,
      ) {
        const profileName = Option.isSome(givenProfileName) ? givenProfileName : cwdProfileResolver.resolve(cwd)
        yield* chrome.launch({ profileName, url })
      })

      return { invoke }
    }),
  )
}

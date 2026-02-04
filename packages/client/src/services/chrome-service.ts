import type { ChromeLaunchError } from '@chroma/server'
import type { RpcClientError } from '@effect/rpc'
import { Context, Effect, Layer, type Option } from 'effect'
import { ChromeClient } from '../externals/chrome-client'
import { type InvalidProfileNameError, ProfileNameResolver } from './profile-name-resolver'

export class ChromeService extends Context.Tag('@chroma/client/services/ChromeService')<
  ChromeService,
  {
    readonly launch: (
      profileName: Option.Option<string>,
      url: Option.Option<string>,
    ) => Effect.Effect<void, ChromeLaunchError | InvalidProfileNameError | RpcClientError.RpcClientError>
  }
>() {
  static readonly layer = Layer.effect(
    ChromeService,
    Effect.gen(function* () {
      const profileNameResolver = yield* ProfileNameResolver
      const chrome = yield* ChromeClient

      const launch = Effect.fn('ChromeService.launch')(function* (
        givenProfileName: Option.Option<string>,
        url: Option.Option<string>,
      ) {
        const profileName = yield* Effect.transposeMapOption(givenProfileName, profileNameResolver.resolve)

        yield* chrome.launch({ profileName, url })
      })

      return { launch }
    }),
  ).pipe(Layer.provide(ProfileNameResolver.layer))
}

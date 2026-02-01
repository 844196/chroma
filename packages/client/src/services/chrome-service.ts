import { Effect, type Option } from 'effect'
import { ChromeClient } from '../externals/chrome-client'
import { ProfileNameResolver } from './profile-name-resolver'

export class ChromeService extends Effect.Service<ChromeService>()('@chroma/client/services/ChromeService', {
  accessors: true,
  dependencies: [ProfileNameResolver.Default],
  effect: Effect.gen(function* () {
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
}) {}

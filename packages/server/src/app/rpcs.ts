import { Rpc, RpcGroup } from '@effect/rpc'
import { Effect, Schema } from 'effect'
import { ProfileName } from '../schemas/profile-name'
import { ChromeLaunchError } from '../services/chrome-launcher'
import { ChromeService } from '../services/chrome-service'
import { LoggingMiddleware } from './logging-middleware'

export class ChromeRpcGroup extends RpcGroup.make(
  Rpc.make('launch', {
    payload: {
      profileName: Schema.Option(ProfileName),
      url: Schema.Option(Schema.NonEmptyString),
    },
    error: ChromeLaunchError,
  }),
).middleware(LoggingMiddleware) {}

export const ChromeRpcLive = ChromeRpcGroup.toLayer(
  Effect.gen(function* () {
    const chrome = yield* ChromeService

    return {
      launch: ({ profileName, url }) => chrome.launch(profileName, url),
    }
  }),
)

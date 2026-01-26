import { Rpc, RpcGroup } from '@effect/rpc'
import { Effect, Schema } from 'effect'
import { ProfileName } from '../schemas/profile-name'
import { ChromeLaunchError, ChromeService } from '../services/chrome-service'

export class ChromeRpcGroup extends RpcGroup.make(
  Rpc.make('launch', {
    payload: {
      profileName: Schema.Option(ProfileName),
      args: Schema.Array(Schema.String),
    },
    error: ChromeLaunchError,
  }),
) {}

export const ChromeRpcLive = ChromeRpcGroup.toLayer(
  Effect.gen(function* () {
    const chrome = yield* ChromeService

    return {
      launch: ({ profileName, args }) => chrome.launch(profileName, args),
    }
  }),
)

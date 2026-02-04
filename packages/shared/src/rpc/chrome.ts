import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'
import { ChromeLaunchError } from '../errors'
import { ProfileName } from '../schemas'

export class ChromeRpcGroup extends RpcGroup.make(
  Rpc.make('launch', {
    payload: {
      profileName: Schema.Option(ProfileName),
      url: Schema.Option(Schema.NonEmptyString),
    },
    error: ChromeLaunchError,
  }),
) {}

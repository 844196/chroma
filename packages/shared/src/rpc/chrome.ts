import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'
import { ChromeLaunchError } from '../errors/index.ts'
import { ProfileName } from '../schemas/index.ts'

export class ChromeRpcGroup extends RpcGroup.make(
  Rpc.make('launch', {
    payload: {
      profileName: Schema.Option(ProfileName),
      url: Schema.Option(Schema.NonEmptyString),
    },
    error: ChromeLaunchError,
  }),
) {}

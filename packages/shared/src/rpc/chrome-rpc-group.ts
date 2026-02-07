import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'
import { ProfileName } from '../domain/profile-name.ts'
import { ChromeLaunchError } from './chrome-launch-error.ts'

export class ChromeRpcGroup extends RpcGroup.make(
  Rpc.make('launch', {
    payload: {
      profileName: Schema.Option(ProfileName),
      url: Schema.Option(Schema.NonEmptyString),
    },
    error: ChromeLaunchError,
  }),
) {}

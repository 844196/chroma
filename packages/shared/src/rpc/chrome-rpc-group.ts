import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'
import { ChromeLaunchError } from '../domain/chrome-launch-error.ts'
import { InvalidProfileNameError } from '../domain/invalid-profile-name-error.ts'

export class ChromeRpcGroup extends RpcGroup.make(
  Rpc.make('launch', {
    payload: {
      profileName: Schema.Option(Schema.NonEmptyString),
      url: Schema.Option(Schema.NonEmptyString),
    },
    error: Schema.Union(ChromeLaunchError, InvalidProfileNameError),
  }),
) {}

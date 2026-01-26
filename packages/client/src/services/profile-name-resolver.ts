import { ProfileName } from '@chroma/server'
import { Either as E, Effect, Option as O, Schema } from 'effect'
import { Config } from '../externals/config'

export class ProfileNameResolver extends Effect.Service<ProfileNameResolver>()(
  '@chroma/client/services/ProfileNameResolver',
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const { profileNameAliases } = yield* Config

      const resolve = Effect.fn('ProfileNameResolver.resolve')((given: string) => {
        const resolved = O.fromNullable(profileNameAliases.get(given))
        if (O.isSome(resolved)) {
          return Effect.succeed(resolved.value)
        }

        const decoded = Schema.decodeEither(ProfileName)(given)
        if (E.isRight(decoded)) {
          return Effect.succeed(decoded.right)
        }

        return Effect.fail(new InvalidProfileNameError({ cause: decoded.left }))
      })

      return { resolve }
    }),
  },
) {}

export class InvalidProfileNameError extends Schema.TaggedError<InvalidProfileNameError>()('InvalidProfileNameError', {
  cause: Schema.Defect,
}) {}

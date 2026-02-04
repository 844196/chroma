import { ProfileName } from '@chroma/server'
import { Context, Either as E, Effect, Layer, Option as O, Schema } from 'effect'
import { Config } from '../externals/config'

export class ProfileNameResolver extends Context.Tag('@chroma/client/services/ProfileNameResolver')<
  ProfileNameResolver,
  {
    readonly resolve: (given: string) => Effect.Effect<ProfileName, InvalidProfileNameError>
  }
>() {
  static readonly layer = Layer.effect(
    ProfileNameResolver,
    Effect.gen(function* () {
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
  )
}

export class InvalidProfileNameError extends Schema.TaggedError<InvalidProfileNameError>()('InvalidProfileNameError', {
  cause: Schema.Defect,
}) {}

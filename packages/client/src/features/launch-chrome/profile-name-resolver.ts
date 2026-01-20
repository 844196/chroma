import { ProfileName } from '@chroma/server'
import { Context, Data, Either as E, Effect, Layer, Option as O, Schema } from 'effect'
import type { ParseError } from 'effect/ParseResult'
import { AppConfig } from '../../externals/app-config'

export class ProfileNameResolver extends Context.Tag('ProfileNameResolver')<
  ProfileNameResolver,
  (given: string) => Effect.Effect<ProfileName, InvalidProfileNameError>
>() {
  static readonly layer = Layer.effect(
    ProfileNameResolver,
    Effect.gen(function* () {
      const { profileNameAliases } = yield* AppConfig

      return Effect.fn('ProfileNameResolver')((given) => {
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
    }),
  )
}

export class InvalidProfileNameError extends Data.TaggedError('InvalidProfileNameError')<{
  cause: ParseError
}> {}

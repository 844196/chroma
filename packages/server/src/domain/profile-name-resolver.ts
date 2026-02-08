import { Config, InvalidProfileNameError, ProfileName } from '@chroma/shared/domain'
import { Context, Effect, Either, Layer, Option, Schema } from 'effect'

/**
 * プロファイル名を解決する
 *
 * ユーザーが指定した文字列をプロファイルディレクトリ名に変換する。
 * 設定ファイルのエイリアス定義を優先し、一致しなければProfileNameスキーマでバリデーションする。
 */
export class ProfileNameResolver extends Context.Tag('@chroma/server/domain/ProfileNameResolver')<
  ProfileNameResolver,
  {
    /**
     * 指定された文字列をプロファイルディレクトリ名に解決する
     *
     * - エイリアスに一致する場合、対応するプロファイルディレクトリ名を返す
     * - エイリアスに一致せず、ProfileNameスキーマに適合する場合、そのまま返す
     * - いずれにも該当しない場合、InvalidProfileNameErrorで失敗する
     */
    readonly resolve: (given: string) => Effect.Effect<ProfileName, InvalidProfileNameError>
  }
>() {
  static readonly layer = Layer.effect(
    ProfileNameResolver,
    Effect.gen(function* () {
      const { profileAliases } = yield* Config

      const resolve = Effect.fn('ProfileNameResolver.resolve')((given: string) => {
        const resolved = Option.fromNullable(profileAliases.get(given))
        if (Option.isSome(resolved)) {
          return Effect.succeed(resolved.value)
        }

        const decoded = Schema.decodeEither(ProfileName)(given)
        if (Either.isRight(decoded)) {
          return Effect.succeed(decoded.right)
        }

        return Effect.fail(new InvalidProfileNameError({ givenName: given }))
      })

      return { resolve }
    }),
  )
}

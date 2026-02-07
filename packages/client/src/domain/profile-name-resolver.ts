import { Config, ProfileName } from '@chroma/shared/domain'
import { Context, Either as E, Effect, Layer, Option as O, Schema } from 'effect'

/**
 * プロファイル名を解決する
 *
 * ユーザーが指定した文字列をプロファイルディレクトリ名に変換する。
 * 設定ファイルのエイリアス定義を優先し、一致しなければProfileNameスキーマでバリデーションする。
 */
export class ProfileNameResolver extends Context.Tag('@chroma/client/domain/ProfileNameResolver')<
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
        const resolved = O.fromNullable(profileAliases.get(given))
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

/**
 * 指定された文字列がエイリアスにも有効なプロファイル名にも該当しない場合のエラー
 */
export class InvalidProfileNameError extends Schema.TaggedError<InvalidProfileNameError>()('InvalidProfileNameError', {
  cause: Schema.Defect,
}) {}

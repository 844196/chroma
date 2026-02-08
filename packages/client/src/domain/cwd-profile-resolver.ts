import { Config } from '@chroma/shared/domain'
import { Context, Effect, Layer, Option as O } from 'effect'
import { HomeDir } from './home-dir.ts'

/**
 * カレントディレクトリに基づいてプロファイル名を解決する
 *
 * 設定ファイルの `paths` フィールドを参照し、cwdに最長一致するエントリの値を返す。
 */
export class CwdProfileResolver extends Context.Tag('@chroma/client/domain/CwdProfileResolver')<
  CwdProfileResolver,
  {
    /**
     * cwdに基づいてプロファイル名を解決する
     *
     * - `paths` のエントリの中でcwdに前方一致する最も長いパスの値を返す
     * - 一致するエントリがなければ `None` を返す
     */
    readonly resolve: (cwd: string) => O.Option<string>
  }
>() {
  static readonly layer = Layer.effect(
    CwdProfileResolver,
    Effect.gen(function* () {
      const { paths } = yield* Config
      const home = yield* HomeDir

      const expandedEntries = Array.from(paths.entries()).map(([key, value]) => {
        const expandedKey = key.startsWith('~') ? key.replace('~', home) : key
        const normalizedKey = expandedKey.endsWith('/') ? expandedKey : `${expandedKey}/`
        return [normalizedKey, value] as const
      })
      expandedEntries.sort(([a], [b]) => b.length - a.length)

      const resolve = (cwd: string): O.Option<string> => {
        const normalizedCwd = cwd.endsWith('/') ? cwd : `${cwd}/`
        for (const [pathPrefix, profileName] of expandedEntries) {
          if (normalizedCwd.startsWith(pathPrefix)) {
            return O.some(profileName)
          }
        }
        return O.none()
      }

      return { resolve }
    }),
  )
}

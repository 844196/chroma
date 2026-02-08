import type { InvalidProfileNameError } from '@chroma/shared/rpc'
import { Context, Effect, Layer, type Option } from 'effect'
import { CommandExecutor, type CommandFailedError } from '../domain/command-executor.ts'
import { CommandFactory } from '../domain/command-factory.ts'
import { ProfileNameResolver } from '../domain/profile-name-resolver.ts'

/**
 * Chromeを起動するユースケース
 *
 * プロファイル名のエイリアス解決を行い、Chromeを起動する
 *
 * @see {@link ProfileNameResolver} プロファイル名の解決
 */
export class LaunchChromeUseCase extends Context.Tag('@chroma/server/application/LaunchChromeUseCase')<
  LaunchChromeUseCase,
  {
    /**
     * Chromeを起動する
     *
     * - プロファイル名が指定された場合、エイリアス解決を経てChromeを起動する
     * - プロファイル名が指定されなかった場合、プロファイル選択画面が表示される (Chrome挙動依存)
     * - URLは指定されたがプロファイルが指定されなかった場合、直前に使用したプロファイルでURLが開かれる (Chrome挙動依存)
     * - URLは指定されなかったがプロファイルが指定された場合、指定されたプロファイルの "ホームページ" が開かれる (Chrome挙動依存)
     * - URLとプロファイル両方が指定された場合、指定されたプロファイルで指定されたURLが開かれる
     */
    readonly invoke: (
      profileName: Option.Option<string>,
      url: Option.Option<string>,
    ) => Effect.Effect<void, CommandFailedError | InvalidProfileNameError>
  }
>() {
  static readonly layer = Layer.effect(
    LaunchChromeUseCase,
    Effect.gen(function* () {
      const profileNameResolver = yield* ProfileNameResolver
      const factory = yield* CommandFactory
      const executor = yield* CommandExecutor

      const invoke = Effect.fn('LaunchChromeUseCase.invoke')(function* (
        givenProfileName: Option.Option<string>,
        url: Option.Option<string>,
      ) {
        const profileName = yield* Effect.transposeMapOption(givenProfileName, profileNameResolver.resolve)
        const cmd = yield* factory.create(profileName, url)
        yield* executor.exec(cmd)
      })

      return { invoke }
    }),
  )
}

import type { ProfileName } from '@chroma/shared/domain'
import { Context, Effect, Layer, type Option } from 'effect'
import { CommandFactory } from '../../adapter/command-factory.ts'
import { CommandExecutor, type CommandFailedError } from '../../infrastructure/command-executor.ts'

/**
 * Chromeを起動するユースケース
 */
export class LaunchChromeUseCase extends Context.Tag('@chroma/server/use-case/launch-chrome/LaunchChromeUseCase')<
  LaunchChromeUseCase,
  {
    /**
     * Chromeを起動する
     *
     * - URLもプロファイルも指定されなかった場合、プロファイル選択画面が表示される (Chrome挙動依存)
     * - URLは指定されたがプロファイルが指定されなかった場合、直前に使用したプロファイルでURLが開かれる (Chrome挙動依存)
     * - URLは指定されなかったがプロファイルが指定された場合、指定されたプロファイルの "ホームページ" が開かれる (Chrome挙動依存)
     * - URLとプロファイル両方が指定された場合、指定されたプロファイルで指定されたURLが開かれる
     */
    readonly invoke: (
      profileName: Option.Option<ProfileName>,
      url: Option.Option<string>,
    ) => Effect.Effect<void, CommandFailedError> // ユースケース固有のエラー型を定義するほどではないため、インフラ層のエラーをそのまま返している
  }
>() {
  static readonly layer = Layer.effect(
    LaunchChromeUseCase,
    Effect.gen(function* () {
      const factory = yield* CommandFactory
      const executor = yield* CommandExecutor

      const invoke = Effect.fn('LaunchChromeUseCase.invoke')(function* (
        profileName: Option.Option<ProfileName>,
        url: Option.Option<string>,
      ) {
        const cmd = yield* factory.create(profileName, url)
        yield* executor.exec(cmd)
      })

      return { invoke }
    }),
  )
}

import type { ProfileName } from '@chroma/shared/domain'
import { Command } from '@effect/platform'
import { Context, Effect, Option } from 'effect'

/**
 * Chrome起動コマンドを生成する
 *
 * OSごとに異なる起動コマンド、コマンドライン引数、エスケープ処理を吸収する
 */
export class CommandFactory extends Context.Tag('@chroma/server/adapter/CommandFactory')<
  CommandFactory,
  {
    /**
     * Chrome起動コマンドを生成する
     */
    readonly create: (
      profileName: Option.Option<ProfileName>,
      url: Option.Option<string>,
    ) => Effect.Effect<Command.Command>
  }
>() {
  /**
   * macOS向けレイヤー
   */
  static readonly darwinLayer = CommandFactory.of({
    create: Effect.fn('CommandFactory.darwin.create')((profileName, url) => {
      const args: string[] = []
      if (Option.isSome(profileName)) {
        args.push(`--profile-directory=${profileName.value}`)
      }
      if (Option.isSome(url)) {
        args.push(url.value)
      }

      return Effect.succeed(
        Command.make(
          'open',
          // NOTE: すでにChromeが起動している場合でも新しいインスタンスとして起動させる
          // (`-n` がなく、すでにChromeが起動している場合、たとえ異なるプロファイル・URLであっても "すでに起動している" ものとしてコマンドが空振りしてしまう)
          '-n',
          '-a',
          'Google Chrome',
          ...(args.length > 0 ? ['--args', ...args] : []),
        ),
      )
    }),
  })

  /**
   * WSL向けレイヤー
   *
   * NOTE: WSLからWindows版Chromeを起動するためのものであり、WSL上に `apt` などでインストールされたChromeを起動させる *ものではない* ことに注意
   */
  static readonly wslLayer = CommandFactory.of({
    create: Effect.fn('CommandFactory.wsl.create')((profileName, url) => {
      const args: string[] = []
      if (Option.isSome(profileName)) {
        args.push(`'--profile-directory="${profileName.value}"'`)
      }
      if (Option.isSome(url)) {
        args.push(`'${url.value}'`)
      }

      return Effect.succeed(
        Command.make(
          '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
          'Start-Process',
          '-FilePath chrome',
          ...(args.length > 0 ? ['-ArgumentList', args.join(', ')] : []),
        ),
      )
    }),
  })
}

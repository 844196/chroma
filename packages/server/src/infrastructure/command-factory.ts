import type { ProfileName } from '@chroma/shared/domain'
import { Command } from '@effect/platform'
import { Effect, Layer, Option } from 'effect'
import { CommandFactory } from '../domain/command-factory.ts'

/**
 * macOS向けレイヤー
 */
export const CommandFactoryDarwinLive = Layer.succeed(CommandFactory, {
  create: Effect.fn('CommandFactory.darwin.create')(
    (profileName: Option.Option<ProfileName>, url: Option.Option<string>) => {
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
    },
  ),
})

/**
 * WSL向けレイヤー
 *
 * NOTE: WSLからWindows版Chromeを起動するためのものであり、WSL上に `apt` などでインストールされたChromeを起動させる *ものではない* ことに注意
 */
export const CommandFactoryWslLive = Layer.succeed(CommandFactory, {
  create: Effect.fn('CommandFactory.wsl.create')(
    (profileName: Option.Option<ProfileName>, url: Option.Option<string>) => {
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
    },
  ),
})

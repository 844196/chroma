import type { ProfileName } from '@chroma/shared/domain'
import { Command } from '@effect/platform'
import { Array as Arr, Effect, Layer, Option } from 'effect'
import { CommandFactory } from '../domain/command-factory.ts'

/**
 * macOS向けレイヤー
 */
export const CommandFactoryDarwinLive = Layer.succeed(CommandFactory, {
  create: Effect.fn('CommandFactory.darwin.create')(
    (profileName: Option.Option<ProfileName>, url: Option.Option<string>) => {
      const args = Arr.getSomes([Option.map(profileName, (p) => `--profile-directory=${p}`), url])

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
      const args = Arr.getSomes([
        Option.map(profileName, (p) => `'--profile-directory="${p}"'`),
        Option.map(url, (u) => `'${u}'`),
      ])

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

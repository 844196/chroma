import { type as osType } from 'node:os'
import type { ChromeLaunchError } from '@chroma/shared/errors'
import type { ProfileName } from '@chroma/shared/schemas'
import { Command } from '@effect/platform'
import { Context, Effect, Layer, Option } from 'effect'
import isWsl from 'is-wsl'
import { ChromeLauncher } from './chrome-launcher'

export class ChromeService extends Context.Tag('@chroma/server/services/ChromeService')<
  ChromeService,
  {
    readonly launch: (
      profileName: Option.Option<ProfileName>,
      url: Option.Option<string>,
    ) => Effect.Effect<void, ChromeLaunchError>
  }
>() {
  static readonly autoLayer = Layer.unwrapEffect(
    Effect.gen(function* () {
      const os = osType()
      if (os === 'Darwin') {
        return ChromeService.darwinLayer
      }
      if (isWsl) {
        return ChromeService.wslLayer
      }
      return yield* Effect.dieMessage(`unsupported OS: ${os}`)
    }),
  )

  static readonly wslLayer = Layer.effect(
    ChromeService,
    Effect.gen(function* () {
      const launcher = yield* ChromeLauncher

      const launch = Effect.fn('ChromeService.wsl.launch')(function* (
        profileName: Option.Option<ProfileName>,
        url: Option.Option<string>,
      ) {
        const formattedArgs: string[] = []
        if (Option.isSome(profileName)) {
          formattedArgs.push(`'--profile-directory="${profileName.value}"'`)
        }
        if (Option.isSome(url)) {
          formattedArgs.push(`'${url.value}'`)
        }

        const cmd = Command.make(
          '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
          'Start-Process',
          '-FilePath chrome',
          ...(formattedArgs.length > 0 ? ['-ArgumentList', formattedArgs.join(', ')] : []),
        )

        yield* launcher.launch(cmd)
      })

      return { launch }
    }),
  ).pipe(Layer.provide(ChromeLauncher.layer))

  static readonly darwinLayer = Layer.effect(
    ChromeService,
    Effect.gen(function* () {
      const launcher = yield* ChromeLauncher

      const launch = Effect.fn('ChromeService.darwin.launch')(function* (
        profileName: Option.Option<ProfileName>,
        url: Option.Option<string>,
      ) {
        const formattedArgs: string[] = []
        if (Option.isSome(profileName)) {
          formattedArgs.push(`--profile-directory=${profileName.value}`)
        }
        if (Option.isSome(url)) {
          formattedArgs.push(url.value)
        }

        const cmd = Command.make(
          'open',
          '-n',
          '-a',
          'Google Chrome',
          ...(formattedArgs.length > 0 ? ['--args', ...formattedArgs] : []),
        )

        yield* launcher.launch(cmd)
      })

      return { launch }
    }),
  ).pipe(Layer.provide(ChromeLauncher.layer))
}

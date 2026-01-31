import { Command } from '@effect/platform'
import { Context, Effect, Layer, Option } from 'effect'
import type { ProfileName } from '../schemas/profile-name'
import { type ChromeLaunchError, ChromeLauncher } from './chrome-launcher'

export class ChromeService extends Context.Tag('@chroma/server/services/ChromeService')<
  ChromeService,
  {
    readonly launch: (
      profileName: Option.Option<ProfileName>,
      args: ReadonlyArray<string>,
    ) => Effect.Effect<void, ChromeLaunchError>
  }
>() {
  static readonly wslLayer = Layer.effect(
    ChromeService,
    Effect.gen(function* () {
      const launcher = yield* ChromeLauncher

      const launch = Effect.fn('ChromeService.wsl.launch')(function* (
        profileName: Option.Option<ProfileName>,
        args: ReadonlyArray<string>,
      ) {
        const formattedArgs = [...args]
        if (Option.isSome(profileName)) {
          formattedArgs.push(`--profile-directory="""${profileName.value}"""`)
        }

        const cmd = Command.make(
          '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
          'Start-Process',
          '-FilePath chrome',
          `-ArgumentList ${formattedArgs.join(', ')}`,
        )

        yield* launcher.launch(cmd)
      })

      return { launch }
    }),
  ).pipe(Layer.provide(ChromeLauncher.layer))
}

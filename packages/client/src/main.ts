import { Command } from '@cliffy/command'
import { BunContext, BunRuntime } from '@effect/platform-bun'
import { Effect, Layer as L, Option as O } from 'effect'
import { ChromeClient } from './externals/chrome-client.ts'
import { Config } from './externals/config.ts'
import { ChromeService } from './services/chrome-service.ts'

;(async () => {
  const {
    args: [url],
    options: parsedOpts,
  } = await new Command<void, void, { profile?: string; config?: string; host?: string }, [url?: string]>()
    .name('chroma')
    .description('Open URL in specific Google Chrome profile.')
    .version(BUILD_VERSION)
    .meta('Built', BUILD_TIME)
    .env(
      'CHROMA_PROFILE=<PROFILE:string>',
      `
        Specifies the Chrome profile directory to use.
        If -p/--profile is not specified, and this is set, this value will be used.
      `,
      { prefix: 'CHROMA_' },
    )
    .env(
      'CHROMA_HOST=<HOST:string>',
      `
        Daemon socket to connect to.
        If -H/--host is not specified, and this is set, this value will be used.
      `,
      { prefix: 'CHROMA_' },
    )
    .env(
      'CHROMA_CONFIG=<PATH:string>',
      `
        Path to the configuration file.
        If -c/--config is not specified, and this is set, this value will be used.
      `,
      { prefix: 'CHROMA_' },
    )
    .option(
      '-p, --profile <PROFILE:string>',
      `
        Specify the profile to use.
        If given value is an alias defined in the configuration file, it will be resolved to the corresponding profile directory name.
      `,
    )
    .option('-c, --config <PATH:string>', 'Path to the configuration file.')
    .option('-H, --host <HOST:string>', 'Daemon socket to connect to.')
    .arguments('[URL:string]')
    .example('Specified profile by option.', "chroma -p 'Profile 2' 'http://localhost:5173'")
    .example('Specified profile by environment variable.', "CHROMA_PROFILE='Profile 2' chroma 'http://localhost:5173'")
    .example(
      'Use with other CLI tools via $BROWSER.',
      `
        export BROWSER="chroma" CHROMA_PROFILE="Profile 2"
        gh issue list --web
      `,
    )
    .parse()

  const program = Effect.flatMap(ChromeService, ($) =>
    $.launch(O.fromNullable(parsedOpts.profile), O.fromNullable(url)),
  )

  const MainLive = ChromeService.layer.pipe(
    L.provide(Config.layer({ path: parsedOpts.config })),
    L.provide(ChromeClient.layer({ socketPath: parsedOpts.host })),
    L.provide(BunContext.layer),
  )

  BunRuntime.runMain(program.pipe(Effect.provide(MainLive)))
})()

import { RuntimeDir } from '@chroma/server'
import { Command } from '@cliffy/command'
import { BunContext, BunRuntime } from '@effect/platform-bun'
import { Effect, Layer as L, Option as O } from 'effect'
import { AppConfig } from './externals/app-config.ts'
import { AppTRPCClient } from './externals/app-trpc-client.ts'
import { LaunchChrome } from './features/launch-chrome/launch-chrome.ts'
import { ProfileNameResolver } from './features/launch-chrome/profile-name-resolver.ts'

declare const BUILD_VERSION: string

const {
  args: parsedArgs,
  literal: parsedLiteral,
  options: parsedOpts,
} = await new Command()
  .name('chroma')
  .description('Open URL in specific Google Chrome profile.')
  .version(BUILD_VERSION)
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
  .option(
    '-p, --profile <PROFILE:string>',
    `
      Specify the profile to use.
      If given value is an alias defined in the configuration file, it will be resolved to the corresponding profile directory name.
    `,
  )
  .option('-c, --config <PATH:string>', 'Path to the configuration file.')
  .option('-H, --host <HOST:string>', 'Daemon socket to connect to.')
  .arguments('[ARGS...]')
  .example('Specified profile by option.', 'chroma -p "Profile 2" http://localhost:5173')
  .example('Specified profile by environment variable.', 'CHROMA_PROFILE="Profile 2" chroma http://localhost:5173')
  .example(
    'Use with other CLI tools via $BROWSER.',
    `
      export BROWSER="chroma" CHROMA_PROFILE="Profile 2"
      gh issue list --web
    `,
  )
  .parse()

const program = Effect.gen(function* () {
  const launchChrome = yield* LaunchChrome
  yield* launchChrome(O.fromNullable(parsedOpts.profile), [...parsedArgs, ...parsedLiteral])
})

const appLayer = LaunchChrome.layer.pipe(
  L.provideMerge(ProfileNameResolver.layer),
  L.provideMerge(AppConfig.layer(O.fromNullable(parsedOpts.config))),
  L.provideMerge(AppTRPCClient.layer(O.fromNullable(parsedOpts.host))),
  L.provideMerge(RuntimeDir.layer),
  L.provideMerge(BunContext.layer),
)

BunRuntime.runMain(program.pipe(Effect.provide(appLayer)))

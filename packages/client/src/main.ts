import { homedir } from 'node:os'
import { ConfigLive } from '@chroma/shared/infrastructure'
import { Command } from '@cliffy/command'
import { BunContext, BunRuntime } from '@effect/platform-bun'
import { Effect, Layer, Match, Option, ParseResult } from 'effect'
import { LaunchChromeUseCase } from './application/launch-chrome-use-case.ts'
import { CwdProfileResolver } from './domain/cwd-profile-resolver.ts'
import { HomeDir } from './domain/home-dir.ts'
import { ChromeClientLive } from './infrastructure/chrome-client.ts'
import { LaunchChromeCommand } from './presentation/launch-chrome-command.ts'

// NOTE: "bun build --bytecode" はトップレベルawaitをサポートしていないためIIFEで囲む
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

  const MainLive = LaunchChromeCommand.layer.pipe(
    Layer.provide(LaunchChromeUseCase.layer),
    Layer.provide(CwdProfileResolver.layer),
    Layer.provide(Layer.succeed(HomeDir, homedir())),
    Layer.provide(ConfigLive({ path: parsedOpts.config })),
    Layer.provide(ChromeClientLive({ socketPath: parsedOpts.host })),
    Layer.provide(BunContext.layer),
  )

  const program = Effect.gen(function* () {
    const cmd = yield* LaunchChromeCommand
    yield* cmd.run(Option.fromNullable(parsedOpts.profile), Option.fromNullable(url), process.cwd())
  })

  BunRuntime.runMain(
    program.pipe(
      Effect.provide(MainLive),
      Effect.tapError((error) =>
        Match.value(error).pipe(
          Match.tag('ConfigFileReadError', (e) =>
            Effect.sync(() => process.stderr.write(`chroma: could not read config file: ${e.path}\n`)),
          ),
          Match.tag('ConfigFileParseError', (e) =>
            Effect.sync(() => {
              process.stderr.write('chroma: invalid format in config file\n')
              const issues = ParseResult.ArrayFormatter.formatErrorSync(e.cause)
              for (const issue of issues) {
                const path = issue.path.join('.')
                process.stderr.write(path ? `* ${path} ${issue.message}\n` : `* ${issue.message}\n`)
              }
            }),
          ),
          Match.tag('LaunchChromeCommandError', (e) =>
            Effect.sync(() => process.stderr.write(`chroma: ${e.message}\n`)),
          ),
          Match.exhaustive,
        ),
      ),
      Effect.tapDefect(() => Effect.sync(() => process.stderr.write('chroma: an unexpected error occurred.\n'))),
    ),
    { disableErrorReporting: true },
  )
})()

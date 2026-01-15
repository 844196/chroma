import { Command } from '@cliffy/command'
import { DEFAULT_HOST } from '../src/runtime.ts'

// VERSION is injected at compile time
// See mise-tasks/internal/build
const [VERSION, ...args] = Deno.args

await new Command()
  .name('chroma')
  .description('Open URL in specific Google Chrome profile.')
  .version(VERSION)
  .env(
    'CHROMA_PROFILE=<PROFILE:string>',
    'Specifies the Chrome profile directory to use.\nIf -p/--profile is not specified, and this is set, this value will be used.',
    { prefix: 'CHROMA_' },
  )
  .env(
    'CHROMA_HOST=<HOST:string>',
    'Daemon socket to connect to.\nIf -H/--host is not specified, and this is set, this value will be used.',
    { prefix: 'CHROMA_' },
  )
  .option(
    '-p, --profile <PROFILE:string>',
    'Specify the profile to use.\nIf given value is an alias defined in the configuration file, it will be resolved to the corresponding profile directory name.',
  )
  .option(
    '-H, --host <HOST:string>',
    'Daemon socket to connect to.',
    { default: DEFAULT_HOST },
  )
  .arguments('[URL:string]')
  .example(
    'Specified profile by option.',
    'chroma -p "Profile 2" http://localhost:5173',
  )
  .example(
    'Specified profile by environment variable.',
    'CHROMA_PROFILE="Profile 2" chroma http://localhost:5173',
  )
  .example(
    'Use with other CLI tools via $BROWSER.',
    `
      export BROWSER="chroma" CHROMA_PROFILE="Profile 2"
      gh issue list --web
    `,
  )
  .action(() => {
    // TODO
  })
  .parse(args)

import { Command } from '@cliffy/command'
import { DEFAULT_HOST } from '../runtime.ts'

// VERSION is injected at compile time
// See mise-tasks/internal/build
const [VERSION, ...args] = Deno.args

await new Command()
  .name('chroma')
  .description('Start Chrome with a specified profile.')
  .version(VERSION)
  .helpOption('-h, --help', 'Show this help.', function (this: Command) {
    console.log(this.getHelp({ long: true })) // Always show full description
  })
  .env(
    'CHROMA_PROFILE=<CHROME_PROFILE_DIRECTORY_NAME:string>',
    'If -p/--profile is not specified, and this is set, use this.',
    { prefix: 'CHROMA_' },
  )
  .env(
    'CHROMA_HOST=<HOST:string>',
    'If -H/--host is not specified, and this is set, use this.',
    { prefix: 'CHROMA_' },
  )
  .option(
    '-p, --profile <CHROME_PROFILE_DIRECTORY_NAME:string>',
    `
      Chrome profile to use.
      This value is the same as the option argument for the Chrome CLI option "--profile-directory". (e.g. "Profile 3")
      Check the "Profile Path" in chrome://version to see what value to set.
    `,
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

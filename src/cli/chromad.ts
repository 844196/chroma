import { Command } from '@cliffy/command'
import { DEFAULT_RUNTIME_DIR } from '../runtime.ts'

// VERSION is injected at compile time
// See mise-tasks/internal/build
const [VERSION, ...args] = Deno.args

await new Command()
  .name('chromad')
  .version(VERSION)
  .helpOption('-h, --help', 'Show this help.', function (this: Command) {
    console.log(this.getHelp({ long: true })) // Always show full description
  })
  .env(
    'CHROMA_RUNTIME_DIR=<PATH:string>',
    'If --runtime-dir is not specified, and this is set, use this.',
    { prefix: 'CHROMA_' },
  )
  .option(
    '--runtime-dir <PATH:string>',
    'Path to the runtime directory where the daemon socket is located.',
    { default: DEFAULT_RUNTIME_DIR },
  )
  .action(() => {
    // TODO
  })
  .parse(args)

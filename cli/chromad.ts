import { Command } from '@cliffy/command'
import { DEFAULT_DAEMON_CONFIG_PATH, DEFAULT_RUNTIME_DIR } from '../src/runtime.ts'

// VERSION is injected at compile time
// See mise-tasks/internal/build
const [VERSION, ...args] = Deno.args

await new Command()
  .name('chromad')
  .description('Chroma daemon that listens for requests from chroma client.')
  .version(VERSION)
  .option(
    '--config <PATH:string>',
    'Path to the configuration file.',
    { default: DEFAULT_DAEMON_CONFIG_PATH },
  )
  .option(
    '--runtime-dir <PATH:string>',
    'Path to the runtime directory.',
    { default: DEFAULT_RUNTIME_DIR },
  )
  .action(() => {
    // TODO
  })
  .parse(args)

import { Command } from '@cliffy/command'
import { DEFAULT_CONFIG_PATH, DEFAULT_RUNTIME_DIR } from '../runtime.ts'

// VERSION is injected at compile time
// See mise-tasks/internal/build
const [VERSION, ...args] = Deno.args

await new Command()
  .name('chromad')
  .description('Chroma daemon that listens for requests from chroma client.')
  .version(VERSION)
  .env(
    'CHROMA_CONFIG=<PATH:string>',
    'Path to the configuration file.\nIf --config is not specified, and this is set, this value will be used.',
    { prefix: 'CHROMA_' },
  )
  .env(
    'CHROMA_RUNTIME_DIR=<PATH:string>',
    'Path to the runtime directory.\nIf --runtime-dir is not specified, and this is set, this value will be used.',
    { prefix: 'CHROMA_' },
  )
  .option(
    '--config <PATH:string>',
    'Path to the configuration file.',
    { default: DEFAULT_CONFIG_PATH },
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

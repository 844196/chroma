import { Command } from '@cliffy/command'
import { join as joinPath } from 'node:path'
import { DaemonConfigSchema, DEFAULT_DAEMON_CONFIG } from '../config/daemon-config.ts'
import { readConfig } from '../config/read-config.ts'
import { DEFAULT_DAEMON_CONFIG_PATH, DEFAULT_RUNTIME_DIR, DEFAULT_SOCKET_NAME } from '../runtime.ts'
import { createServer } from '../server.ts'

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
  .action(async ({ config: configPath, runtimeDir }) => {
    const config = await readConfig(configPath, DaemonConfigSchema)
      .catch(() => DEFAULT_DAEMON_CONFIG)
    const server = createServer(config)

    Deno.serve({ path: joinPath(runtimeDir, DEFAULT_SOCKET_NAME) }, server.fetch)
  })
  .parse(args)

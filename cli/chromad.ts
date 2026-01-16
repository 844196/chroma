import { Command } from '@cliffy/command'
import { join as joinPath } from 'node:path'
import { DEFAULT_DAEMON_CONFIG_PATH, DEFAULT_RUNTIME_DIR, DEFAULT_SOCKET_NAME } from '../src/app/runtime.ts'
import { createServer } from '../src/app/server.ts'
import { ChromeService } from '../src/features/chrome/chrome-service.ts'
import { ConfigSchema, DEFAULT_CONFIG } from '../src/shared/config.ts'
import { container } from '../src/shared/container.ts'
import { readJson } from '../src/shared/read-json.ts'

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
    const config = await readJson(configPath, ConfigSchema).catch(() => DEFAULT_CONFIG)
    const socketPath = joinPath(runtimeDir, DEFAULT_SOCKET_NAME)

    container.bind('chromeService').toConstantValue(
      new ChromeService(
        config.profileAliases,
        { launch: async () => {} }, // TODO replace with actual launcher
      ),
    )
    const server = createServer(container)

    Deno.serve({ path: socketPath }, server.fetch)
  })
  .parse(args)

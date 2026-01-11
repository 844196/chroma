import { homedir } from 'node:os'
import { join as joinPath } from 'node:path'

export function defaultDaemonConfigPath() {
  const XDG_CONFIG_HOME = Deno.env.get('XDG_CONFIG_HOME')
  if (XDG_CONFIG_HOME !== undefined) {
    return joinPath(XDG_CONFIG_HOME, 'chroma', 'daemon.json')
  }

  return joinPath(homedir(), '.config', 'chroma', 'daemon.json')
}

export function defaultRuntimeDir() {
  const XDG_RUNTIME_DIR = Deno.env.get('XDG_RUNTIME_DIR')
  if (XDG_RUNTIME_DIR !== undefined) {
    return joinPath(XDG_RUNTIME_DIR, 'chroma')
  }

  const UID = Deno.uid()
  if (UID === null) {
    throw new Error('Cannot determine user ID for runtime directory path.')
  }

  return joinPath(Deno.env.get('TMPDIR') ?? '/tmp', `chroma-${UID}`)
}

export const DEFAULT_DAEMON_CONFIG_PATH = defaultDaemonConfigPath()

export const DEFAULT_RUNTIME_DIR = defaultRuntimeDir()

export const DEFAULT_SOCKET_NAME = 'chroma.sock'

export const DEFAULT_SOCKET_PATH = joinPath(DEFAULT_RUNTIME_DIR, DEFAULT_SOCKET_NAME)

export const DEFAULT_HOST = `unix://${DEFAULT_SOCKET_PATH}`

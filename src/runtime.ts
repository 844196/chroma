import { join as joinPath } from 'node:path'

function defaultRuntimeDir() {
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

export const DEFAULT_RUNTIME_DIR = defaultRuntimeDir()

export const DEFAULT_SOCKET_NAME = 'chroma.sock'

export const DEFAULT_SOCKET_PATH = joinPath(DEFAULT_RUNTIME_DIR, DEFAULT_SOCKET_NAME)

export const DEFAULT_HOST = `unix://${DEFAULT_SOCKET_PATH}`

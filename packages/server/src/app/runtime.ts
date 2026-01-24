import { tmpdir, userInfo } from 'node:os'
import { join as joinPath } from 'node:path'
import { Context, Effect, Layer, Option as O, pipe } from 'effect'

export const RUNTIME_DIR = Effect.sync(() =>
  pipe(
    O.fromNullable(process.env.CHROMA_RUNTIME_DIR),
    O.orElse(() => O.map(O.fromNullable(process.env.XDG_RUNTIME_DIR), (dir) => joinPath(dir, 'chroma'))),
    O.getOrElse(() => joinPath(tmpdir(), `chroma-${userInfo().uid}`)),
  ),
)

export class RuntimeDir extends Context.Tag('RuntimeDir')<RuntimeDir, string>() {
  static readonly layer = Layer.effect(RuntimeDir, RUNTIME_DIR)
}

export const SOCKET_PATH = Effect.gen(function* () {
  const runtimeDir = yield* RuntimeDir
  return joinPath(runtimeDir, 'chroma.sock')
})

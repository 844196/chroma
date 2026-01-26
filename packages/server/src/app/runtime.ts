import { tmpdir, userInfo } from 'node:os'
import { join as joinPath } from 'node:path'
import { FileSystem } from '@effect/platform'
import { Context, Effect, Layer, Option as O } from 'effect'

export class RuntimeDir extends Context.Tag('@chroma/server/app/RuntimeDir')<RuntimeDir, string>() {
  static readonly Default = Layer.effect(
    RuntimeDir,
    Effect.sync(() =>
      O.fromNullable(process.env.CHROMA_RUNTIME_DIR).pipe(
        O.orElse(() => O.map(O.fromNullable(process.env.XDG_RUNTIME_DIR), (dir) => joinPath(dir, 'chroma'))),
        O.getOrElse(() => joinPath(tmpdir(), `chroma-${userInfo().uid}`)),
      ),
    ),
  )
}

export class SocketPath extends Context.Tag('@chroma/server/app/SocketPath')<SocketPath, string>() {
  static readonly DefaultWithoutDependencies = Layer.effect(
    SocketPath,
    Effect.map(RuntimeDir, (dir) => joinPath(dir, 'chroma.sock')),
  )

  static readonly Default = SocketPath.DefaultWithoutDependencies.pipe(Layer.provide(RuntimeDir.Default))
}

export const UnixSocket = Effect.fn('UnixSocket')(function* (path: string) {
  const fs = yield* FileSystem.FileSystem

  const acquire = Effect.gen(function* () {
    const alreadyExists = yield* fs.exists(path).pipe(Effect.orDie)
    if (alreadyExists) {
      return yield* Effect.dieMessage(`Address already in use: ${path}`)
    }
    return { path }
  })
  const release = Effect.fn('UnixSocket.release')(() => Effect.orDie(fs.remove(path)))

  return yield* Effect.acquireRelease(acquire, release)
})

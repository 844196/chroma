import { tmpdir, userInfo } from 'node:os'
import { join as joinPath } from 'node:path'
import { FileSystem } from '@effect/platform'
import { Context, Effect, Layer, Option as O, Schema } from 'effect'

export class RuntimeDir extends Context.Tag('@chroma/server/app/RuntimeDir')<RuntimeDir, string>() {
  static readonly layer = Layer.effect(
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
  static readonly layerWithoutDependencies = Layer.effect(
    SocketPath,
    Effect.map(RuntimeDir, (dir) => joinPath(dir, 'chroma.sock')),
  )

  static readonly layer = SocketPath.layerWithoutDependencies.pipe(Layer.provide(RuntimeDir.layer))
}

export const UnixSocket = Effect.fn('UnixSocket')(function* (path: string) {
  const fs = yield* FileSystem.FileSystem

  const acquire = Effect.gen(function* () {
    const alreadyExists = yield* fs.exists(path).pipe(Effect.orDie)
    if (alreadyExists) {
      return yield* new AddressAlreadyInUseError({ path })
    }
    return { path }
  })
  const release = Effect.fn('UnixSocket.release')(function* () {
    yield* Effect.logDebug(`removing unix socket`).pipe(Effect.annotateLogs({ path }))

    yield* fs.remove(path).pipe(Effect.orDie)
  })

  return yield* Effect.acquireRelease(acquire, release)
})

export class AddressAlreadyInUseError extends Schema.TaggedError<AddressAlreadyInUseError>()(
  'AddressAlreadyInUseError',
  {
    path: Schema.String,
  },
) {}

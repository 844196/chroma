import { FileSystem } from '@effect/platform'
import { Effect, Schema } from 'effect'

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

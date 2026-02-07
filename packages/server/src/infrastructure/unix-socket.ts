import { FileSystem } from '@effect/platform'
import { Effect, Schema } from 'effect'

/**
 * サーバーが通信で使用するUNIXドメインソケットを表す
 *
 * サーバーのライフサイクルと同一のスコープで使用されることを想定しており、
 * 使用時点で同名のソケットファイルが存在しないことが保証され、
 * サーバー終了時 (スコープ解放時) に使用していたソケットファイルの削除を試みる
 *
 * @see {@link https://effect.website/docs/resource-management/scope/#acquirerelease}
 */
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

/**
 * {@link UnixSocket} が既に存在するソケットファイルを指している場合に発生するエラー
 */
export class AddressAlreadyInUseError extends Schema.TaggedError<AddressAlreadyInUseError>()(
  'AddressAlreadyInUseError',
  {
    path: Schema.String,
  },
) {}

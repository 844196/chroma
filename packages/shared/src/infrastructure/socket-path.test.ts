import { describe, expect, it } from '@effect/vitest'
import { Effect, Layer } from 'effect'
import { RuntimeDir } from './runtime-dir.ts'
import { SocketPath } from './socket-path.ts'

describe('SocketPath', () => {
  it.effect('ランタイムディレクトリ内のソケットパスを返すこと', () => {
    const testLayer = SocketPath.layerWithoutDependencies.pipe(
      Layer.provide(Layer.succeed(RuntimeDir, '/path/to/runtime-dir')),
    )

    return Effect.gen(function* () {
      expect(yield* SocketPath).toBe('/path/to/runtime-dir/chroma.sock')
    }).pipe(Effect.provide(testLayer))
  })
})

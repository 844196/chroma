import { describe, expect, it } from '@effect/vitest'
import { Effect, Layer } from 'effect'
import { vi } from 'vitest'
import { RuntimeDir, SocketPath } from './runtime'

const mockedTmpdir = vi.hoisted(() => vi.fn())
const mockedUserInfo = vi.hoisted(() => vi.fn())

vi.mock('node:os', () => ({
  tmpdir: mockedTmpdir,
  userInfo: mockedUserInfo,
}))

describe('RuntimeDir', () => {
  describe('when CHROMA_RUNTIME_DIR is set', () => {
    it.effect('should use CHROMA_RUNTIME_DIR', () => {
      vi.stubEnv('CHROMA_RUNTIME_DIR', '/path/to/chroma-runtime-dir')

      return Effect.gen(function* () {
        expect(yield* RuntimeDir).toBe('/path/to/chroma-runtime-dir')
      }).pipe(Effect.provide(RuntimeDir.layer))
    })
  })

  describe('when XDG_RUNTIME_DIR is set', () => {
    it.effect('should use XDG_RUNTIME_DIR', () => {
      vi.stubEnv('CHROMA_RUNTIME_DIR', undefined)
      vi.stubEnv('XDG_RUNTIME_DIR', '/path/to/xdg-runtime-dir')

      return Effect.gen(function* () {
        expect(yield* RuntimeDir).toBe('/path/to/xdg-runtime-dir/chroma')
      }).pipe(Effect.provide(RuntimeDir.layer))
    })
  })

  describe('when both CHROMA_RUNTIME_DIR and XDG_RUNTIME_DIR are set', () => {
    it.effect('should prefer CHROMA_RUNTIME_DIR', () => {
      vi.stubEnv('CHROMA_RUNTIME_DIR', '/path/to/chroma-runtime-dir')
      vi.stubEnv('XDG_RUNTIME_DIR', '/path/to/xdg-runtime-dir')

      return Effect.gen(function* () {
        expect(yield* RuntimeDir).toBe('/path/to/chroma-runtime-dir')
      }).pipe(Effect.provide(RuntimeDir.layer))
    })
  })

  describe('when CHROMA_RUNTIME_DIR and XDG_RUNTIME_DIR are not set', () => {
    it.effect('should use system tmpdir', () => {
      vi.stubEnv('CHROMA_RUNTIME_DIR', undefined)
      vi.stubEnv('XDG_RUNTIME_DIR', undefined)

      mockedTmpdir.mockReturnValueOnce('/path/to/tmpdir')
      mockedUserInfo.mockReturnValueOnce({ uid: 65534 })

      return Effect.gen(function* () {
        expect(yield* RuntimeDir).toBe('/path/to/tmpdir/chroma-65534')
      }).pipe(Effect.provide(RuntimeDir.layer))
    })
  })
})

describe('SocketPath', () => {
  it.effect('should return the socket path inside the runtime directory', () => {
    const testLayer = SocketPath.layerWithoutDependencies.pipe(
      Layer.provide(Layer.succeed(RuntimeDir, '/path/to/runtime-dir')),
    )

    return Effect.gen(function* () {
      expect(yield* SocketPath).toBe('/path/to/runtime-dir/chroma.sock')
    }).pipe(Effect.provide(testLayer))
  })
})

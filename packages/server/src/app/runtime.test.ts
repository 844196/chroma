import { describe, expect, it } from '@effect/vitest'
import { Effect } from 'effect'
import { vi } from 'vitest'
import { RUNTIME_DIR, RuntimeDir, SOCKET_PATH } from './runtime'

const mockedTmpdir = vi.hoisted(() => vi.fn())
const mockedUserInfo = vi.hoisted(() => vi.fn())

vi.mock('node:os', () => ({
  tmpdir: mockedTmpdir,
  userInfo: mockedUserInfo,
}))

describe('RUNTIME_DIR', () => {
  describe('when CHROMA_RUNTIME_DIR is set', () => {
    it.effect('should use CHROMA_RUNTIME_DIR', () =>
      Effect.gen(function* () {
        vi.stubEnv('CHROMA_RUNTIME_DIR', '/path/to/chroma_runtime_dir')

        expect(yield* RUNTIME_DIR).toBe('/path/to/chroma_runtime_dir')
      }),
    )
  })

  describe('when XDG_RUNTIME_DIR is set', () => {
    it.effect('should use XDG_RUNTIME_DIR', () =>
      Effect.gen(function* () {
        vi.stubEnv('CHROMA_RUNTIME_DIR', undefined)
        vi.stubEnv('XDG_RUNTIME_DIR', '/path/to/xdg_runtime_dir')

        expect(yield* RUNTIME_DIR).toBe('/path/to/xdg_runtime_dir/chroma')
      }),
    )
  })

  describe('when both CHROMA_RUNTIME_DIR and XDG_RUNTIME_DIR are set', () => {
    it.effect('should prefer CHROMA_RUNTIME_DIR', () =>
      Effect.gen(function* () {
        vi.stubEnv('CHROMA_RUNTIME_DIR', '/path/to/chroma_runtime_dir')
        vi.stubEnv('XDG_RUNTIME_DIR', '/path/to/xdg_runtime_dir')

        expect(yield* RUNTIME_DIR).toBe('/path/to/chroma_runtime_dir')
      }),
    )
  })

  describe('when CHROMA_RUNTIME_DIR and XDG_RUNTIME_DIR are not set', () => {
    it.effect('should use system tmpdir', () =>
      Effect.gen(function* () {
        vi.stubEnv('CHROMA_RUNTIME_DIR', undefined)
        vi.stubEnv('XDG_RUNTIME_DIR', undefined)

        mockedTmpdir.mockReturnValueOnce('/path/to/tmpdir')
        mockedUserInfo.mockReturnValueOnce({ uid: 65534 })

        expect(yield* RUNTIME_DIR).toBe('/path/to/tmpdir/chroma-65534')
      }),
    )
  })
})

describe('SOCKET_PATH', () => {
  it.effect('should return the socket path inside the runtime directory', () =>
    Effect.gen(function* () {
      expect(yield* SOCKET_PATH).toBe('/path/to/runtime_dir/chroma.sock')
    }).pipe(Effect.provideService(RuntimeDir, '/path/to/runtime_dir')),
  )
})

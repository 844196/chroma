import { describe, expect, it } from '@effect/vitest'
import { Effect } from 'effect'
import { vi } from 'vitest'
import { RuntimeDir } from './runtime-dir.ts'

const mockedTmpdir = vi.hoisted(() => vi.fn())
const mockedUserInfo = vi.hoisted(() => vi.fn())

vi.mock('node:os', () => ({
  tmpdir: mockedTmpdir,
  userInfo: mockedUserInfo,
}))

describe('RuntimeDir', () => {
  describe('CHROMA_RUNTIME_DIRが設定されている場合', () => {
    it.effect('CHROMA_RUNTIME_DIRが使用されること', () => {
      vi.stubEnv('CHROMA_RUNTIME_DIR', '/path/to/chroma-runtime-dir')

      return Effect.gen(function* () {
        expect(yield* RuntimeDir).toBe('/path/to/chroma-runtime-dir')
      }).pipe(Effect.provide(RuntimeDir.layer))
    })
  })

  describe('XDG_RUNTIME_DIRが設定されている場合', () => {
    it.effect('XDG_RUNTIME_DIRが使用されること', () => {
      vi.stubEnv('CHROMA_RUNTIME_DIR', undefined)
      vi.stubEnv('XDG_RUNTIME_DIR', '/path/to/xdg-runtime-dir')

      return Effect.gen(function* () {
        expect(yield* RuntimeDir).toBe('/path/to/xdg-runtime-dir/chroma')
      }).pipe(Effect.provide(RuntimeDir.layer))
    })
  })

  describe('CHROMA_RUNTIME_DIRとXDG_RUNTIME_DIRの両方が設定されている場合', () => {
    it.effect('CHROMA_RUNTIME_DIRが優先されること', () => {
      vi.stubEnv('CHROMA_RUNTIME_DIR', '/path/to/chroma-runtime-dir')
      vi.stubEnv('XDG_RUNTIME_DIR', '/path/to/xdg-runtime-dir')

      return Effect.gen(function* () {
        expect(yield* RuntimeDir).toBe('/path/to/chroma-runtime-dir')
      }).pipe(Effect.provide(RuntimeDir.layer))
    })
  })

  describe('CHROMA_RUNTIME_DIRとXDG_RUNTIME_DIRが未設定の場合', () => {
    it.effect('システムのtmpdirが使用されること', () => {
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

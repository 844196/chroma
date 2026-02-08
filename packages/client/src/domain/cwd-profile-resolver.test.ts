import { Config } from '@chroma/shared/domain'
import { describe, expect, it } from '@effect/vitest'
import { Effect, Layer, Option } from 'effect'
import { CwdProfileResolver } from './cwd-profile-resolver.ts'
import { HomeDir } from './home-dir.ts'

const MOCK_HOMEDIR = '/mock/home'

const testConfig = (paths: ReadonlyMap<string, string>) =>
  Layer.succeed(Config, Config.of({ profileAliases: new Map(), paths }))

const buildTestLayer = (paths: ReadonlyMap<string, string>) =>
  CwdProfileResolver.layer.pipe(Layer.provide(testConfig(paths)), Layer.provide(Layer.succeed(HomeDir, MOCK_HOMEDIR)))

describe('CwdProfileResolver', () => {
  describe('resolve', () => {
    it.effect('cwdがpathsのエントリに前方一致する場合、対応する値を返すこと', () => {
      const testLayer = buildTestLayer(new Map([['/home/user/work', 'work-profile']]))

      return Effect.gen(function* () {
        const resolver = yield* CwdProfileResolver
        const result = resolver.resolve('/home/user/work/project')
        expect(Option.isSome(result)).toBe(true)
        expect(Option.getOrThrow(result)).toBe('work-profile')
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('cwdがpathsのどのエントリにも一致しない場合、Noneを返すこと', () => {
      const testLayer = buildTestLayer(new Map([['/home/user/work', 'work-profile']]))

      return Effect.gen(function* () {
        const resolver = yield* CwdProfileResolver
        const result = resolver.resolve('/home/user/personal/project')
        expect(Option.isNone(result)).toBe(true)
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('複数エントリがある場合、最長一致するエントリが使われること', () => {
      const testLayer = buildTestLayer(
        new Map([
          ['/home/user/work', 'work-profile'],
          ['/home/user/work/special', 'special-profile'],
        ]),
      )

      return Effect.gen(function* () {
        const resolver = yield* CwdProfileResolver
        const result = resolver.resolve('/home/user/work/special/project')
        expect(Option.isSome(result)).toBe(true)
        expect(Option.getOrThrow(result)).toBe('special-profile')
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('~を含むパスが展開されること', () => {
      const testLayer = buildTestLayer(new Map([['~/work', 'work-profile']]))

      return Effect.gen(function* () {
        const resolver = yield* CwdProfileResolver
        const result = resolver.resolve(`${MOCK_HOMEDIR}/work/project`)
        expect(Option.isSome(result)).toBe(true)
        expect(Option.getOrThrow(result)).toBe('work-profile')
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('cwdに末尾/がなくても正しくマッチすること', () => {
      const testLayer = buildTestLayer(new Map([['/home/user/work', 'work-profile']]))

      return Effect.gen(function* () {
        const resolver = yield* CwdProfileResolver
        const result = resolver.resolve('/home/user/work')
        expect(Option.isSome(result)).toBe(true)
        expect(Option.getOrThrow(result)).toBe('work-profile')
      }).pipe(Effect.provide(testLayer))
    })
  })
})

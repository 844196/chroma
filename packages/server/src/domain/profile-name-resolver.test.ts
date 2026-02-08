import { Config, InvalidProfileNameError, type ProfileName } from '@chroma/shared/domain'
import { assert, describe, expect, it } from '@effect/vitest'
import { Effect, Either, Layer } from 'effect'
import { ProfileNameResolver } from './profile-name-resolver.ts'

const aliasMap = (entries: Array<[string, string]>): ReadonlyMap<string, ProfileName> =>
  new Map(entries.map(([k, v]) => [k, v as ProfileName]))

const testConfig = (aliases: ReadonlyMap<string, ProfileName>) =>
  Layer.succeed(Config, Config.of({ profileAliases: aliases }))

describe('ProfileNameResolver', () => {
  describe('resolve', () => {
    describe('指定された名前がprofileAliasesに存在する場合', () => {
      // biome-ignore format: For data alignment.
      it.effect.each([
        ['work',     aliasMap([['work', 'Profile 1']]),    'Profile 1'],
        ['personal', aliasMap([['personal', 'Default']]),  'Default'  ],
      ] as const)('エイリアス"%s"が"%s"に解決されること', ([input, aliases, expected]) => {
        const testLayer = ProfileNameResolver.layer.pipe(Layer.provide(testConfig(aliases)))

        return Effect.gen(function* () {
          const resolver = yield* ProfileNameResolver
          const result = yield* resolver.resolve(input)
          expect(result).toBe(expected)
        }).pipe(Effect.provide(testLayer))
      })
    })

    describe('指定された名前がエイリアスではないが有効なProfileNameの場合', () => {
      // biome-ignore format: For data alignment.
      it.effect.each([
        ['Default'],
        ['Profile 1'],
        ['Profile 42'],
      ] as const)('"%s"がそのまま返されること', ([input]) => {
        const testLayer = ProfileNameResolver.layer.pipe(Layer.provide(testConfig(aliasMap([]))))

        return Effect.gen(function* () {
          const resolver = yield* ProfileNameResolver
          const result = yield* resolver.resolve(input)
          expect(result).toBe(input)
        }).pipe(Effect.provide(testLayer))
      })
    })

    describe('指定された名前がエイリアスでも有効なProfileNameでもない場合', () => {
      // biome-ignore format: For data alignment.
      it.effect.each([
        ['',           'empty string'        ],
        ['default',    'lowercase default'   ],
        ['profile 1',  'lowercase profile'   ],
        ['Profile 0',  'zero is invalid'     ],
        ['Profile -1', 'negative is invalid' ],
        ['Profile 1 ', 'trailing space'      ],
        [' Profile 1', 'leading space'       ],
        ['foo',        'arbitrary string'    ],
      ] as const)('"%s"(%s)に対してInvalidProfileNameErrorで失敗すること', ([input]) => {
        const testLayer = ProfileNameResolver.layer.pipe(Layer.provide(testConfig(aliasMap([]))))

        return Effect.gen(function* () {
          const resolver = yield* ProfileNameResolver
          const result = yield* resolver.resolve(input).pipe(Effect.either)
          assert(Either.isLeft(result))
          expect(result.left).toBeInstanceOf(InvalidProfileNameError)
        }).pipe(Effect.provide(testLayer))
      })
    })

    describe('優先順位', () => {
      it.effect('ProfileNameスキーマバリデーションよりエイリアスが優先されること', () => {
        const testLayer = ProfileNameResolver.layer.pipe(
          Layer.provide(testConfig(aliasMap([['Default', 'Profile 99']]))),
        )

        return Effect.gen(function* () {
          const resolver = yield* ProfileNameResolver
          const result = yield* resolver.resolve('Default')
          expect(result).toBe('Profile 99')
        }).pipe(Effect.provide(testLayer))
      })
    })
  })
})

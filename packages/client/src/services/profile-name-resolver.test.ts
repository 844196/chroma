import type { ProfileName } from '@chroma/server'
import { describe, expect, it } from '@effect/vitest'
import { Effect, Layer } from 'effect'
import { Config } from '../externals/config'
import { InvalidProfileNameError, ProfileNameResolver } from './profile-name-resolver'

const aliasMap = (entries: Array<[string, string]>): ReadonlyMap<string, ProfileName> =>
  new Map(entries.map(([k, v]) => [k, v as ProfileName]))

const testConfig = (aliases: ReadonlyMap<string, ProfileName>) =>
  Layer.succeed(Config, Config.make({ profileNameAliases: aliases }))

describe('ProfileNameResolver', () => {
  describe('resolve', () => {
    describe('when the given name exists in profileNameAliases', () => {
      // biome-ignore format: For data alignment.
      it.effect.each([
        ['work',     aliasMap([['work', 'Profile 1']]),    'Profile 1'],
        ['personal', aliasMap([['personal', 'Default']]),  'Default'  ],
      ] as const)('should resolve alias "%s" to "%s"', ([input, aliases, expected]) => {
        const testLayer = ProfileNameResolver.Default.pipe(Layer.provide(testConfig(aliases)))

        return Effect.gen(function* () {
          const result = yield* ProfileNameResolver.resolve(input)
          expect(result).toBe(expected)
        }).pipe(Effect.provide(testLayer))
      })
    })

    describe('when the given name is not an alias but a valid ProfileName', () => {
      // biome-ignore format: For data alignment.
      it.effect.each([
        ['Default'],
        ['Profile 1'],
        ['Profile 42'],
      ] as const)('should return "%s" as-is', ([input]) => {
        const testLayer = ProfileNameResolver.Default.pipe(Layer.provide(testConfig(aliasMap([]))))

        return Effect.gen(function* () {
          const result = yield* ProfileNameResolver.resolve(input)
          expect(result).toBe(input)
        }).pipe(Effect.provide(testLayer))
      })
    })

    describe('when the given name is neither an alias nor a valid ProfileName', () => {
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
      ] as const)('should fail with InvalidProfileNameError for "%s" (%s)', ([input]) => {
        const testLayer = ProfileNameResolver.Default.pipe(Layer.provide(testConfig(aliasMap([]))))

        return Effect.gen(function* () {
          const result = yield* ProfileNameResolver.resolve(input).pipe(Effect.either)
          expect(result._tag).toBe('Left')
          if (result._tag === 'Left') {
            expect(result.left).toBeInstanceOf(InvalidProfileNameError)
          }
        }).pipe(Effect.provide(testLayer))
      })
    })

    describe('priority', () => {
      it.effect('should prefer alias over ProfileName schema validation', () => {
        const testLayer = ProfileNameResolver.Default.pipe(
          Layer.provide(testConfig(aliasMap([['Default', 'Profile 99']]))),
        )

        return Effect.gen(function* () {
          const result = yield* ProfileNameResolver.resolve('Default')
          expect(result).toBe('Profile 99')
        }).pipe(Effect.provide(testLayer))
      })
    })
  })
})

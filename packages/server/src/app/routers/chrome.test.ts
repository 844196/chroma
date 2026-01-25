import { BunContext } from '@effect/platform-bun'
import { beforeEach, describe, expect, it, vi } from '@effect/vitest'
import { Effect, Layer, Option } from 'effect'
import { ChromeLaunchError, ChromeLauncher } from '../../features/launch-chrome/chrome-launcher'
import { ProfileName } from '../../schemas/profile-name'
import { chromeRouter, LaunchChromeRequest } from './chrome'

describe('chromeRouter', () => {
  describe('launch', () => {
    let alwaysSuccessfulLauncher: typeof ChromeLauncher.Service

    beforeEach(() => {
      alwaysSuccessfulLauncher = vi.fn(() => Effect.void)
    })

    describe('happy path', () => {
      describe('when called with profileName', () => {
        it.scoped('should call ChromeLauncher with the given profileName', () =>
          Effect.gen(function* () {
            const router = yield* chromeRouter
            const caller = router.createCaller({})

            const input = LaunchChromeRequest.make({
              profileName: ProfileName.make('Profile 1'),
              args: ['https://example.com'],
            })
            const result = yield* Effect.promise(() => caller.launch(input))

            expect(result).toBeUndefined()
            expect(alwaysSuccessfulLauncher).toHaveBeenCalledTimes(1)
            expect(alwaysSuccessfulLauncher).toHaveBeenCalledWith(Option.some('Profile 1'), ['https://example.com'])
          }).pipe(
            Effect.provide(
              BunContext.layer.pipe(Layer.provideMerge(Layer.succeed(ChromeLauncher, alwaysSuccessfulLauncher))),
            ),
          ),
        )
      })

      describe('when called without profileName', () => {
        it.scoped('should call ChromeLauncher with None', () =>
          Effect.gen(function* () {
            const router = yield* chromeRouter
            const caller = router.createCaller({})

            const input = LaunchChromeRequest.make({
              args: ['https://example.com'],
            })
            const result = yield* Effect.promise(() => caller.launch(input))

            expect(result).toBeUndefined()
            expect(alwaysSuccessfulLauncher).toHaveBeenCalledTimes(1)
            expect(alwaysSuccessfulLauncher).toHaveBeenCalledWith(Option.none(), ['https://example.com'])
          }).pipe(
            Effect.provide(
              BunContext.layer.pipe(Layer.provideMerge(Layer.succeed(ChromeLauncher, alwaysSuccessfulLauncher))),
            ),
          ),
        )
      })

      describe('when failed to launch Chrome', () => {
        it.scoped('should throw named error', () => {
          const alwaysFailingLauncher: typeof ChromeLauncher.Service = () =>
            Effect.fail(
              new ChromeLaunchError({
                exitCode: 42,
                stdout: 'Some stdout',
                stderr: 'Some stderr',
              }),
            )

          return Effect.gen(function* () {
            const router = yield* chromeRouter
            const caller = router.createCaller({})

            const input = LaunchChromeRequest.make({ args: ['https://example.com'] })
            const result = yield* Effect.tryPromise(() => caller.launch(input)).pipe(
              Effect.catchAll((e) => Effect.succeed(e.cause)),
            )

            expect(result).toMatchObject({
              code: 'INTERNAL_SERVER_ERROR',
              data: {
                type: 'chrome.launch_failed',
                ctx: {
                  exitCode: 42,
                  stdout: 'Some stdout',
                  stderr: 'Some stderr',
                },
              },
            })
          }).pipe(
            Effect.provide(
              BunContext.layer.pipe(Layer.provideMerge(Layer.succeed(ChromeLauncher, alwaysFailingLauncher))),
            ),
          )
        })
      })
    })

    describe('when called with valid input', () => {
      // biome-ignore format: For data alignment.
      const validInputs = [
        LaunchChromeRequest.make({ args: [] }),
        LaunchChromeRequest.make({ args: ['https://example.com'] }),
        LaunchChromeRequest.make({ args: [], profileName: ProfileName.make('Default') }),
        LaunchChromeRequest.make({ args: ['https://example.com'], profileName:  ProfileName.make('Default') }),
        LaunchChromeRequest.make({ args: [], profileName: ProfileName.make('Profile 1') }),
        LaunchChromeRequest.make({ args: ['https://example.com'], profileName: ProfileName.make('Profile 1') }),
      ] as const

      it.scoped.each(validInputs)('should accept %o', (input) =>
        Effect.gen(function* () {
          const router = yield* chromeRouter
          const caller = router.createCaller({})

          const result = yield* Effect.promise(() => caller.launch(input))
          expect(result).toBeUndefined()
        }).pipe(
          Effect.provide(
            BunContext.layer.pipe(Layer.provideMerge(Layer.succeed(ChromeLauncher, alwaysSuccessfulLauncher))),
          ),
        ),
      )
    })
  })
})

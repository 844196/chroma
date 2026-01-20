import { Effect, Either, Option, Schema } from 'effect'
import { ChromeLauncher } from '../../features/launch-chrome/chrome-launcher.ts'
import { ProfileName } from '../../schemas/profile-name.ts'
import { AppTRPCError } from '../app-trpc-error.ts'
import { publicProcedure, router } from '../trpc.ts'

export const LaunchChromeRequest = Schema.Struct({
  profileName: Schema.optional(ProfileName),
  args: Schema.Array(Schema.String),
})

export const chromeRouter = Effect.gen(function* () {
  const launchChrome = yield* ChromeLauncher

  return router({
    launch: publicProcedure
      // @effect-diagnostics schemaSyncInEffect:off
      .input(Schema.decodeUnknownSync(LaunchChromeRequest))
      .mutation(async ({ input: { profileName, args } }) => {
        // @effect-diagnostics runEffectInsideEffect:off
        const result = await Effect.runPromise(Effect.either(launchChrome(Option.fromNullable(profileName), args)))
        if (Either.isRight(result)) {
          return
        }

        const cause = result.left
        throw new AppTRPCError({
          message: 'Failed to launch Chrome',
          code: 'INTERNAL_SERVER_ERROR',
          data: {
            type: 'chrome.launch_failed',
            ctx: {
              exitCode: cause.exitCode,
              stdout: cause.stdout,
              stderr: cause.stderr,
            },
          },
          cause,
        })
      }),
  })
})

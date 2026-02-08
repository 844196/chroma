import { ChromeLaunchError, ChromeRpcGroup, InvalidProfileNameError } from '@chroma/shared/rpc'
import { Effect, Layer } from 'effect'
import { LaunchChromeUseCase } from '../application/launch-chrome-use-case.ts'
import { LoggingMiddleware } from './logging-middleware.ts'

export const ChromeRpcLive = ChromeRpcGroup.middleware(LoggingMiddleware)
  .toLayer(
    Effect.gen(function* () {
      const launchChromeUseCase = yield* LaunchChromeUseCase

      const launch = Effect.fn('ChromeRpcGroup.launch')(function* ({ profileName, url }) {
        yield* launchChromeUseCase.invoke(profileName, url).pipe(
          Effect.catchTags({
            CommandFailedError: (e) =>
              Effect.fail(new ChromeLaunchError({ exitCode: e.exitCode, stdout: e.stdout, stderr: e.stderr })),
            InvalidProfileNameError: (e) => Effect.fail(new InvalidProfileNameError({ givenName: e.givenName })),
          }),
        )
      })

      return { launch }
    }),
  )
  .pipe(Layer.provide(LoggingMiddleware.layer))

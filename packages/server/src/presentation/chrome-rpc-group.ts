import { ChromeLaunchError, ChromeRpcGroup } from '@chroma/shared/rpc'
import { Effect, Layer } from 'effect'
import { LaunchChromeUseCase } from '../application/launch-chrome-use-case.ts'
import { LoggingMiddleware } from './logging-middleware.ts'

export const ChromeRpcLive = ChromeRpcGroup.middleware(LoggingMiddleware)
  .toLayer(
    Effect.gen(function* () {
      const launchChromeUseCase = yield* LaunchChromeUseCase

      return {
        launch: ({ profileName, url }) =>
          launchChromeUseCase
            .invoke(profileName, url)
            .pipe(
              Effect.mapError(
                (err) => new ChromeLaunchError({ exitCode: err.exitCode, stdout: err.stdout, stderr: err.stderr }),
              ),
            ),
      }
    }),
  )
  .pipe(Layer.provide(LoggingMiddleware.layer))

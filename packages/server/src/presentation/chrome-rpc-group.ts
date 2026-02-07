import { ChromeRpcGroup } from '@chroma/shared/rpc'
import { Effect, Layer } from 'effect'
import { LaunchChromeUseCase } from '../use-case/launch-chrome/launch-chrome-use-case.ts'
import { LoggingMiddleware } from './logging-middleware.ts'

export const ChromeRpcLive = ChromeRpcGroup.middleware(LoggingMiddleware)
  .toLayer(
    Effect.gen(function* () {
      const launchChromeUseCase = yield* LaunchChromeUseCase

      return {
        launch: ({ profileName, url }) => launchChromeUseCase.invoke(profileName, url),
      }
    }),
  )
  .pipe(Layer.provide(LoggingMiddleware.layer))

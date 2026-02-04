import { ChromeRpcGroup } from '@chroma/shared/rpc'
import { Effect, Layer } from 'effect'
import { ChromeService } from '../services/chrome-service'
import { LoggingMiddleware } from './logging-middleware'

export const ChromeRpcLive = ChromeRpcGroup.middleware(LoggingMiddleware)
  .toLayer(
    Effect.gen(function* () {
      const chrome = yield* ChromeService

      return {
        launch: ({ profileName, url }) => chrome.launch(profileName, url),
      }
    }),
  )
  .pipe(Layer.provide(LoggingMiddleware.layer))

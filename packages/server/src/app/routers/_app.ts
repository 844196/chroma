import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { Effect } from 'effect'
import { router } from '../trpc.ts'
import { chromeRouter } from './chrome.ts'

export const appRouter = Effect.gen(function* () {
  return router({ chrome: yield* chromeRouter })
})

export type AppRouter = Effect.Effect.Success<typeof appRouter>
export type AppRouterInput = inferRouterInputs<AppRouter>
export type AppRouterOutput = inferRouterOutputs<AppRouter>

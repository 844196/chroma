import { initTRPC } from '@trpc/server'
import { AppTRPCError } from './app-trpc-error.ts'

const t = initTRPC.create({
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        custom: error instanceof AppTRPCError ? error.data : undefined,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure

export const ENDPOINT_BASE_URL = new URL('http://localhost/trpc')

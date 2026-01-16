import type { container } from './shared/container.ts'

declare module '@hono/hono' {
  interface ContextVariableMap {
    container: typeof container
  }
}

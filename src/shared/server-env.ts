import type { container } from './container.ts'

export type ServerEnv = {
  Bindings: {
    container: typeof container
  }
}

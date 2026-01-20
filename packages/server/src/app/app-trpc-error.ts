import { TRPCError } from '@trpc/server'

export type AppErrorData = {
  type: 'chrome.launch_failed'
  ctx: {
    exitCode: number
    stdout: string
    stderr: string
  }
}

export class AppTRPCError extends TRPCError {
  override readonly name = 'AppTRPCError'
  readonly data: AppErrorData

  constructor({ data, ...opts }: ConstructorParameters<typeof TRPCError>[0] & { data: AppErrorData }) {
    super(opts)
    this.data = data
  }
}

import { SocketPath } from '@chroma/shared/infrastructure'
import { ChromeRpcGroup } from '@chroma/shared/rpc'
import { FetchHttpClient } from '@effect/platform'
import { RpcClient, RpcSerialization } from '@effect/rpc'
import { Effect, Layer, Option } from 'effect'
import { ChromeClient } from '../domain/chrome-client.ts'

export const ChromeClientLive = (opts: { socketPath?: string | undefined }) =>
  Layer.unwrapEffect(
    Effect.gen(function* () {
      const socketPath = yield* Option.match(Option.fromNullable(opts.socketPath), {
        onNone: () => SocketPath,
        onSome: Effect.succeed,
      })

      const FetchUnixSocketClientLive = FetchHttpClient.layer.pipe(
        Layer.provide(
          Layer.succeed(
            FetchHttpClient.Fetch,
            // @ts-expect-error bun fetch option
            (input, init) => fetch(input, { ...init, unix: socketPath }),
          ),
        ),
      )

      return Layer.scoped(ChromeClient, RpcClient.make(ChromeRpcGroup)).pipe(
        Layer.provide(RpcClient.layerProtocolHttp({ url: 'http://unused/rpc' })),
        Layer.provide(RpcSerialization.layerNdjson),
        Layer.provide(FetchUnixSocketClientLive),
      )
    }),
  ).pipe(Layer.provide(SocketPath.layer))

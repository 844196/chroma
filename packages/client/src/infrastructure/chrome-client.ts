import { SocketPath } from '@chroma/shared/infrastructure'
import { ChromeRpcGroup } from '@chroma/shared/rpc'
import { FetchHttpClient } from '@effect/platform'
import { RpcClient, RpcSerialization } from '@effect/rpc'
import { Effect, Layer as L, Option } from 'effect'
import { ChromeClient } from '../use-case/launch-chrome/chrome-client.ts'

export const ChromeClientLive = (opts: { socketPath?: string | undefined }) =>
  L.unwrapEffect(
    Effect.gen(function* () {
      const socketPath = yield* Option.match(Option.fromNullable(opts.socketPath), {
        onNone: () => SocketPath,
        onSome: Effect.succeed,
      })

      const FetchUnixSocketClientLive = FetchHttpClient.layer.pipe(
        L.provide(
          L.succeed(
            FetchHttpClient.Fetch,
            // @ts-expect-error bun fetch option
            (input, init) => fetch(input, { ...init, unix: socketPath }),
          ),
        ),
      )

      return L.scoped(ChromeClient, RpcClient.make(ChromeRpcGroup)).pipe(
        L.provide(RpcClient.layerProtocolHttp({ url: 'http://unused/rpc' })),
        L.provide(RpcSerialization.layerNdjson),
        L.provide(FetchUnixSocketClientLive),
      )
    }),
  ).pipe(L.provide(SocketPath.layer))

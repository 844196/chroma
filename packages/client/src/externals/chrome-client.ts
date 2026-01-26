import { ChromeRpcGroup, ServerSocketPath } from '@chroma/server'
import { FetchHttpClient } from '@effect/platform'
import { RpcClient, type RpcClientError, RpcSerialization } from '@effect/rpc'
import type { Rpcs } from '@effect/rpc/RpcGroup'
import { Context, Effect, Layer as L, Option } from 'effect'

export class ChromeClient extends Context.Tag('@chroma/client/externals/ChromeClient')<
  ChromeClient,
  RpcClient.RpcClient<Rpcs<typeof ChromeRpcGroup>, RpcClientError.RpcClientError>
>() {
  static readonly Default = (opts: { socketPath?: string | undefined } = {}) =>
    L.unwrapEffect(
      Effect.gen(function* () {
        const socketPath = yield* Option.match(Option.fromNullable(opts.socketPath), {
          onNone: () => ServerSocketPath,
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
    ).pipe(L.provide(ServerSocketPath.Default))
}

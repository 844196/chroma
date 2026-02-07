import { SocketPath } from '@chroma/shared/infrastructure'
import { ChromeRpcGroup } from '@chroma/shared/rpc'
import { FetchHttpClient } from '@effect/platform'
import { RpcClient, type RpcClientError, RpcSerialization } from '@effect/rpc'
import type { Rpcs } from '@effect/rpc/RpcGroup'
import { Context, Effect, Layer as L, Option } from 'effect'

/**
 * サーバーとのRPCクライアント
 *
 * UNIXドメインソケット経由で @chroma/server にRPCリクエストを送信する
 */
export class ChromeClient extends Context.Tag('@chroma/client/infrastructure/ChromeClient')<
  ChromeClient,
  RpcClient.RpcClient<Rpcs<typeof ChromeRpcGroup>, RpcClientError.RpcClientError>
>() {
  static readonly layer = (opts: { socketPath?: string | undefined } = {}) =>
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
}

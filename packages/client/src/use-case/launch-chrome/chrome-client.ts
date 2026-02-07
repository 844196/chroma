import type { ChromeRpcGroup } from '@chroma/shared/rpc'
import type { RpcClient, RpcClientError } from '@effect/rpc'
import type { Rpcs } from '@effect/rpc/RpcGroup'
import { Context } from 'effect'

/**
 * サーバーとのRPCクライアント
 *
 * UNIXドメインソケット経由で @chroma/server にRPCリクエストを送信する
 */
export class ChromeClient extends Context.Tag('@chroma/client/use-case/launch-chrome/ChromeClient')<
  ChromeClient,
  RpcClient.RpcClient<Rpcs<typeof ChromeRpcGroup>, RpcClientError.RpcClientError>
>() {}

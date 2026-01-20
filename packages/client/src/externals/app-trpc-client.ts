import { type AppRouter, type AppRouterInput, DEFAULT_SOCKET_PATH, ENDPOINT_BASE_URL } from '@chroma/server'
import { createTRPCClient, httpBatchLink, TRPCClientError } from '@trpc/client'
import { Context, Data, Effect, Layer, Match, Option } from 'effect'

export class AppTRPCClient extends Context.Tag('AppTRPCClient')<
  AppTRPCClient,
  Readonly<{
    launchChrome: (
      input: AppRouterInput['chrome']['launch'],
    ) => Effect.Effect<void, AppTRPCClientConnectionError | AppTRPCClientError>
  }>
>() {
  static readonly layer = (specifiedSocketPath: Option.Option<string>) =>
    Layer.effect(
      AppTRPCClient,
      Effect.gen(function* () {
        const socketPath = yield* Option.match(specifiedSocketPath, {
          onNone: () => DEFAULT_SOCKET_PATH,
          onSome: (h) => Effect.succeed(h),
        })

        const server = createTRPCClient<AppRouter>({
          links: [
            httpBatchLink({
              url: `${ENDPOINT_BASE_URL}`,
              // @ts-expect-error bun fetch option
              fetch: (input, init) => fetch(input, { ...init, unix: socketPath }),
            }),
          ],
        })

        const launchChrome = Effect.fn('AppTRPCClient.launchChrome')((input: AppRouterInput['chrome']['launch']) =>
          Effect.tryPromise(() => server.chrome.launch.mutate(input)).pipe(
            Effect.mapBoth({
              onSuccess: () => Effect.void,
              onFailure: (unknownError) => {
                if (!(unknownError.cause instanceof TRPCClientError)) {
                  return unknownError
                }
                const trpcClientError: TRPCClientError<AppRouter> = unknownError.cause

                return Match.value(trpcClientError.cause as unknown).pipe(
                  Match.when(
                    { code: 'FailedToOpenSocket' },
                    () => new AppTRPCClientConnectionError({ message: 'Daemon socket does not exist.', socketPath }),
                  ),
                  Match.orElse(() => new AppTRPCClientError({ cause: trpcClientError })),
                )
              },
            }),
            Effect.catchTag('UnknownException', Effect.die),
          ),
        )

        return { launchChrome }
      }),
    )
}

export class AppTRPCClientConnectionError extends Data.TaggedError('AppTRPCClientConnectionError')<{
  message: string
  socketPath: string
}> {}

export class AppTRPCClientError extends Data.TaggedError('AppTRPCClientError')<{
  cause: TRPCClientError<AppRouter>
}> {}

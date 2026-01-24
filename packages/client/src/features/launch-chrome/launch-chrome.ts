import type { ProfileName } from '@chroma/server'
import { Context, Data, Effect, Layer, Match, Option as O } from 'effect'
import { AppTRPCClient, type AppTRPCClientConnectionError } from '../../externals/app-trpc-client'
import { type InvalidProfileNameError, ProfileNameResolver } from './profile-name-resolver'

export class LaunchChrome extends Context.Tag('LaunchChrome')<
  LaunchChrome,
  (
    givenProfileName: O.Option<string>,
    args: ReadonlyArray<string>,
  ) => Effect.Effect<void, InvalidProfileNameError | AppTRPCClientConnectionError | LaunchChromeError>
>() {
  static readonly layer = Layer.effect(
    LaunchChrome,
    Effect.gen(function* () {
      const profileNameResolver = yield* ProfileNameResolver
      const server = yield* AppTRPCClient

      return Effect.fn('LaunchChrome')(function* (givenProfileName, args) {
        const profileName = yield* O.match(givenProfileName, {
          onNone: () => Effect.succeed(O.none<ProfileName>()),
          onSome: (s) => Effect.map(profileNameResolver(s), O.some),
        })

        const result = server.launchChrome({
          profileName: O.getOrUndefined(profileName),
          args,
        })

        yield* Effect.catchTag(result, 'AppTRPCClientError', ({ cause }) =>
          Match.value(cause).pipe(
            Match.when({ data: { custom: { type: 'chrome.launch_failed' } } }, (e) =>
              Effect.fail(new LaunchChromeError({ message: e.message, ...e.data.custom.ctx })),
            ),
            Match.orElse((e) => Effect.dieMessage(e.message)),
          ),
        )
      })
    }),
  )
}

export class LaunchChromeError extends Data.TaggedError('LaunchChromeError')<{
  message: string
  exitCode: number
  stdout: string
  stderr: string
}> {}

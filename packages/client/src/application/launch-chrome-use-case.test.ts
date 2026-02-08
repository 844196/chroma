import { ProfileName } from '@chroma/shared/domain'
import { ChromeLaunchError } from '@chroma/shared/rpc'
import { assert, describe, expect, it } from '@effect/vitest'
import { Cause, Effect, Exit, Layer, Option, Schema } from 'effect'
import { ChromeClient } from '../domain/chrome-client.ts'
import { InvalidProfileNameError, ProfileNameResolver } from '../domain/profile-name-resolver.ts'
import { LaunchChromeUseCase } from './launch-chrome-use-case.ts'

const profileName = Schema.decodeSync(ProfileName)('Default')

const createMockResolver = (resolve: (given: string) => Effect.Effect<ProfileName, InvalidProfileNameError>) =>
  Layer.succeed(ProfileNameResolver, { resolve })

// ChromeClientはRpcClient型のためLayer.succeedで直接モックを提供する
const createMockChromeClient = (
  launch: (payload: {
    profileName: Option.Option<ProfileName>
    url: Option.Option<string>
  }) => Effect.Effect<void, ChromeLaunchError>,
) => Layer.succeed(ChromeClient, { launch } as never)

const buildTestLayer = (mockResolver: Layer.Layer<ProfileNameResolver>, mockChromeClient: Layer.Layer<ChromeClient>) =>
  LaunchChromeUseCase.layer.pipe(Layer.provide(Layer.merge(mockResolver, mockChromeClient)))

describe('LaunchChromeUseCase', () => {
  describe('invoke', () => {
    it.effect('プロファイル名が指定された場合、解決されたプロファイル名とURLでlaunchが呼ばれること', () => {
      let receivedProfileName: Option.Option<ProfileName> = Option.none()
      let receivedUrl: Option.Option<string> = Option.none()

      const testLayer = buildTestLayer(
        createMockResolver(() => Effect.succeed(profileName)),
        createMockChromeClient((payload) => {
          receivedProfileName = payload.profileName
          receivedUrl = payload.url
          return Effect.void
        }),
      )

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        yield* useCase.invoke(Option.some('work'), Option.some('https://example.com'))

        expect(Option.isSome(receivedProfileName)).toBe(true)
        assert(Option.isSome(receivedProfileName))
        expect(receivedProfileName.value).toBe(profileName)

        expect(Option.isSome(receivedUrl)).toBe(true)
        assert(Option.isSome(receivedUrl))
        expect(receivedUrl.value).toBe('https://example.com')
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('プロファイル名が指定されなかった場合、profileNameがNoneでlaunchが呼ばれること', () => {
      let receivedProfileName: Option.Option<ProfileName> = Option.some(profileName)
      let receivedUrl: Option.Option<string> = Option.none()

      const testLayer = buildTestLayer(
        createMockResolver(() => Effect.succeed(profileName)),
        createMockChromeClient((payload) => {
          receivedProfileName = payload.profileName
          receivedUrl = payload.url
          return Effect.void
        }),
      )

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        yield* useCase.invoke(Option.none(), Option.some('https://example.com'))

        expect(Option.isNone(receivedProfileName)).toBe(true)

        expect(Option.isSome(receivedUrl)).toBe(true)
        assert(Option.isSome(receivedUrl))
        expect(receivedUrl.value).toBe('https://example.com')
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('ProfileNameResolverが失敗した場合、InvalidProfileNameErrorが伝搬されること', () => {
      const testLayer = buildTestLayer(
        createMockResolver(() => Effect.fail(new InvalidProfileNameError({ cause: new Error('invalid') }))),
        createMockChromeClient(() => Effect.void),
      )

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        const result = yield* Effect.exit(useCase.invoke(Option.some('invalid'), Option.none()))
        expect(Exit.isFailure(result)).toBe(true)
        assert(Exit.isFailure(result))

        const cause = Cause.failureOption(result.cause)
        expect(Option.isSome(cause)).toBe(true)
        assert(Option.isSome(cause))

        expect(cause.value).toBeInstanceOf(InvalidProfileNameError)
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('ChromeClient.launchがChromeLaunchErrorで失敗した場合、そのまま伝搬されること', () => {
      const testLayer = buildTestLayer(
        createMockResolver(() => Effect.succeed(profileName)),
        createMockChromeClient(() => Effect.fail(new ChromeLaunchError({ exitCode: 1, stdout: 'out', stderr: 'err' }))),
      )

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        const result = yield* Effect.exit(useCase.invoke(Option.some('work'), Option.none()))
        expect(Exit.isFailure(result)).toBe(true)
        assert(Exit.isFailure(result))

        const cause = Cause.failureOption(result.cause)
        expect(Option.isSome(cause)).toBe(true)
        assert(Option.isSome(cause))

        expect(cause.value).toBeInstanceOf(ChromeLaunchError)
        assert(cause.value instanceof ChromeLaunchError)
        expect(cause.value.exitCode).toBe(1)
        expect(cause.value.stdout).toBe('out')
        expect(cause.value.stderr).toBe('err')
      }).pipe(Effect.provide(testLayer))
    })
  })
})

import { ChromeLaunchError, InvalidProfileNameError } from '@chroma/shared/domain'
import { assert, describe, expect, it } from '@effect/vitest'
import { Cause, Effect, Exit, Layer, Option } from 'effect'
import { ChromeClient } from '../domain/chrome-client.ts'
import { CwdProfileResolver } from '../domain/cwd-profile-resolver.ts'
import { LaunchChromeUseCase } from './launch-chrome-use-case.ts'

// ChromeClientはRpcClient型のためLayer.succeedで直接モックを提供する
const createMockChromeClient = (
  launch: (payload: {
    profileName: Option.Option<string>
    url: Option.Option<string>
  }) => Effect.Effect<void, ChromeLaunchError | InvalidProfileNameError>,
) => Layer.succeed(ChromeClient, { launch } as never)

const createMockCwdProfileResolver = (resolve: (cwd: string) => Option.Option<string>) =>
  Layer.succeed(CwdProfileResolver, { resolve })

const buildTestLayer = (
  mockChromeClient: Layer.Layer<ChromeClient>,
  mockCwdProfileResolver: Layer.Layer<CwdProfileResolver> = createMockCwdProfileResolver(() => Option.none()),
) => LaunchChromeUseCase.layer.pipe(Layer.provide(mockChromeClient), Layer.provide(mockCwdProfileResolver))

describe('LaunchChromeUseCase', () => {
  describe('invoke', () => {
    it.effect('プロファイル名が指定された場合、そのままlaunchに渡されること', () => {
      let receivedProfileName: Option.Option<string> = Option.none()
      let receivedUrl: Option.Option<string> = Option.none()

      const testLayer = buildTestLayer(
        createMockChromeClient((payload) => {
          receivedProfileName = payload.profileName
          receivedUrl = payload.url
          return Effect.void
        }),
      )

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        yield* useCase.invoke(Option.some('work'), Option.some('https://example.com'), '/tmp')

        expect(Option.isSome(receivedProfileName)).toBe(true)
        assert(Option.isSome(receivedProfileName))
        expect(receivedProfileName.value).toBe('work')

        expect(Option.isSome(receivedUrl)).toBe(true)
        assert(Option.isSome(receivedUrl))
        expect(receivedUrl.value).toBe('https://example.com')
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('プロファイル名が指定されなかった場合、profileNameがNoneでlaunchが呼ばれること', () => {
      let receivedProfileName: Option.Option<string> = Option.some('dummy')
      let receivedUrl: Option.Option<string> = Option.none()

      const testLayer = buildTestLayer(
        createMockChromeClient((payload) => {
          receivedProfileName = payload.profileName
          receivedUrl = payload.url
          return Effect.void
        }),
      )

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        yield* useCase.invoke(Option.none(), Option.some('https://example.com'), '/tmp')

        expect(Option.isNone(receivedProfileName)).toBe(true)

        expect(Option.isSome(receivedUrl)).toBe(true)
        assert(Option.isSome(receivedUrl))
        expect(receivedUrl.value).toBe('https://example.com')
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('ChromeClient.launchがChromeLaunchErrorで失敗した場合、そのまま伝搬されること', () => {
      const testLayer = buildTestLayer(
        createMockChromeClient(() => Effect.fail(new ChromeLaunchError({ exitCode: 1, stdout: 'out', stderr: 'err' }))),
      )

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        const result = yield* Effect.exit(useCase.invoke(Option.some('work'), Option.none(), '/tmp'))
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

    it.effect('ChromeClient.launchがInvalidProfileNameErrorで失敗した場合、そのまま伝搬されること', () => {
      const testLayer = buildTestLayer(
        createMockChromeClient(() => Effect.fail(new InvalidProfileNameError({ givenName: 'invalid' }))),
      )

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        const result = yield* Effect.exit(useCase.invoke(Option.some('invalid'), Option.none(), '/tmp'))
        expect(Exit.isFailure(result)).toBe(true)
        assert(Exit.isFailure(result))

        const cause = Cause.failureOption(result.cause)
        expect(Option.isSome(cause)).toBe(true)
        assert(Option.isSome(cause))

        expect(cause.value).toBeInstanceOf(InvalidProfileNameError)
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('プロファイル名未指定でpathsに一致する場合、解決された値がサーバーに送信されること', () => {
      let receivedProfileName: Option.Option<string> = Option.none()

      const testLayer = buildTestLayer(
        createMockChromeClient((payload) => {
          receivedProfileName = payload.profileName
          return Effect.void
        }),
        createMockCwdProfileResolver((cwd) =>
          cwd.startsWith('/home/user/work') ? Option.some('work-profile') : Option.none(),
        ),
      )

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        yield* useCase.invoke(Option.none(), Option.none(), '/home/user/work/project')

        expect(Option.isSome(receivedProfileName)).toBe(true)
        assert(Option.isSome(receivedProfileName))
        expect(receivedProfileName.value).toBe('work-profile')
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('プロファイル名未指定でpathsに一致しない場合、Noneがサーバーに送信されること', () => {
      let receivedProfileName: Option.Option<string> = Option.some('dummy')

      const testLayer = buildTestLayer(
        createMockChromeClient((payload) => {
          receivedProfileName = payload.profileName
          return Effect.void
        }),
        createMockCwdProfileResolver(() => Option.none()),
      )

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        yield* useCase.invoke(Option.none(), Option.none(), '/home/user/other')

        expect(Option.isNone(receivedProfileName)).toBe(true)
      }).pipe(Effect.provide(testLayer))
    })

    it.effect('プロファイル名が明示指定されている場合、pathsの一致に関わらず指定値が使われること', () => {
      let receivedProfileName: Option.Option<string> = Option.none()

      const testLayer = buildTestLayer(
        createMockChromeClient((payload) => {
          receivedProfileName = payload.profileName
          return Effect.void
        }),
        createMockCwdProfileResolver(() => Option.some('cwd-profile')),
      )

      return Effect.gen(function* () {
        const useCase = yield* LaunchChromeUseCase

        yield* useCase.invoke(Option.some('explicit-profile'), Option.none(), '/home/user/work/project')

        expect(Option.isSome(receivedProfileName)).toBe(true)
        assert(Option.isSome(receivedProfileName))
        expect(receivedProfileName.value).toBe('explicit-profile')
      }).pipe(Effect.provide(testLayer))
    })
  })
})

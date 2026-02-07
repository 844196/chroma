import { ProfileName } from '@chroma/shared/domain'
import { Command } from '@effect/platform'
import { describe, expect, it } from '@effect/vitest'
import { Effect, Option, Schema } from 'effect'
import { CommandFactory } from './command-factory.ts'

const profileName = Schema.decodeSync(ProfileName)('Default')

describe('CommandFactory', () => {
  describe('darwinLayer', () => {
    const { create } = CommandFactory.darwinLayer

    it.effect('profileName, urlともにNoneの場合、--argsなしのopenコマンドが生成されること', () =>
      Effect.gen(function* () {
        const result = yield* create(Option.none(), Option.none())
        const expected = Command.make('open', '-n', '-a', 'Google Chrome')
        expect(result.toJSON()).toEqual(expected.toJSON())
      }),
    )

    it.effect('profileNameのみSomeの場合、--argsにprofile-directoryが含まれること', () =>
      Effect.gen(function* () {
        const result = yield* create(Option.some(profileName), Option.none())
        const expected = Command.make('open', '-n', '-a', 'Google Chrome', '--args', '--profile-directory=Default')
        expect(result.toJSON()).toEqual(expected.toJSON())
      }),
    )

    it.effect('urlのみSomeの場合、--argsにURLが含まれること', () =>
      Effect.gen(function* () {
        const result = yield* create(Option.none(), Option.some('https://example.com'))
        const expected = Command.make('open', '-n', '-a', 'Google Chrome', '--args', 'https://example.com')
        expect(result.toJSON()).toEqual(expected.toJSON())
      }),
    )

    it.effect('profileName, urlともにSomeの場合、--argsにprofile-directoryとURLが含まれること', () =>
      Effect.gen(function* () {
        const result = yield* create(Option.some(profileName), Option.some('https://example.com'))
        const expected = Command.make(
          'open',
          '-n',
          '-a',
          'Google Chrome',
          '--args',
          '--profile-directory=Default',
          'https://example.com',
        )
        expect(result.toJSON()).toEqual(expected.toJSON())
      }),
    )
  })

  describe('wslLayer', () => {
    const { create } = CommandFactory.wslLayer
    const powershell = '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe'

    it.effect('profileName, urlともにNoneの場合、-ArgumentListなしのStart-Processコマンドが生成されること', () =>
      Effect.gen(function* () {
        const result = yield* create(Option.none(), Option.none())
        const expected = Command.make(powershell, 'Start-Process', '-FilePath chrome')
        expect(result.toJSON()).toEqual(expected.toJSON())
      }),
    )

    it.effect('profileNameのみSomeの場合、-ArgumentListにprofile-directoryが含まれること', () =>
      Effect.gen(function* () {
        const result = yield* create(Option.some(profileName), Option.none())
        const expected = Command.make(
          powershell,
          'Start-Process',
          '-FilePath chrome',
          '-ArgumentList',
          '\'--profile-directory="Default"\'',
        )
        expect(result.toJSON()).toEqual(expected.toJSON())
      }),
    )

    it.effect('urlのみSomeの場合、-ArgumentListにURLが含まれること', () =>
      Effect.gen(function* () {
        const result = yield* create(Option.none(), Option.some('https://example.com'))
        const expected = Command.make(
          powershell,
          'Start-Process',
          '-FilePath chrome',
          '-ArgumentList',
          "'https://example.com'",
        )
        expect(result.toJSON()).toEqual(expected.toJSON())
      }),
    )

    it.effect('profileName, urlともにSomeの場合、-ArgumentListにprofile-directoryとURLが含まれること', () =>
      Effect.gen(function* () {
        const result = yield* create(Option.some(profileName), Option.some('https://example.com'))
        const expected = Command.make(
          powershell,
          'Start-Process',
          '-FilePath chrome',
          '-ArgumentList',
          "'--profile-directory=\"Default\"', 'https://example.com'",
        )
        expect(result.toJSON()).toEqual(expected.toJSON())
      }),
    )
  })
})

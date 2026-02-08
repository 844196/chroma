import { describe, expect, it } from '@effect/vitest'
import { Either, Schema } from 'effect'
import { ProfileName } from './profile-name.ts'

describe('ProfileName', () => {
  // biome-ignore format: For data alignment.
  it.each([
    ['Default'],
    ['Profile 1'],
    ['Profile 42'],
  ])('"%s"はバリデーションを通過すること', (input) => {
    const result  = Schema.decodeUnknownEither(ProfileName)(input)
    expect(Either.isRight(result)).toBe(true)
  })

  // biome-ignore format: For data alignment.
  it.each([
    [''],
    ['default'],
    ['profile 1'],
    ['Profile 1 '],
    [' Profile 1'],
    [' Profile 1 '],
    ['Profile 0'],
    ['Profile -42'],
  ])('"%s"はバリデーションに失敗すること', (input) => {
    const result  = Schema.decodeUnknownEither(ProfileName)(input)
    expect(Either.isRight(result)).toBe(false)
  })
})

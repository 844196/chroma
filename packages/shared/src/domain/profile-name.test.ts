import { describe, expect, it } from '@effect/vitest'
import { Either, Schema } from 'effect'
import { ProfileName } from './profile-name.ts'

describe('ProfileName', () => {
  // biome-ignore format: For data alignment.
  it.each([
    ['Default'],
    ['Profile 1'],
    ['Profile 42'],
  ])('should pass validation for "%s"', (input) => {
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
  ])('should fail validation for "%s"', (input) => {
    const result  = Schema.decodeUnknownEither(ProfileName)(input)
    expect(Either.isRight(result)).toBe(false)
  })
})

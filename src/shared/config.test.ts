import { assertEquals, assertThrows } from '@std/assert'
import { describe, it } from '@std/testing/bdd'
import { z } from '@zod/zod/mini'
import { ConfigSchema } from './config.ts'

describe('ConfigSchema', () => {
  describe('valid inputs', () => {
    it('should accept empty object', () => {
      const result = ConfigSchema.parse({})
      assertEquals(result, { profileAliases: new Map() })
    })

    it('should accept object with empty profileAliases', () => {
      const input = { profileAliases: {} }
      const result = ConfigSchema.parse(input)
      assertEquals(result, { profileAliases: new Map() })
    })

    it('should accept object with valid profileAliases', () => {
      const input = {
        profileAliases: {
          'Default': ['main', 'default'],
          'Profile 2': ['work'],
        },
      }
      const result = ConfigSchema.parse(input)
      const expected = {
        profileAliases: new Map([
          ['main', 'Default'],
          ['default', 'Default'],
          ['work', 'Profile 2'],
        ]),
      }
      assertEquals(result, expected)
    })

    it('should ignore unknown additional properties (strip)', () => {
      const input = {
        profileAliases: {},
        unknownField: 'value',
        anotherField: 123,
      }
      const result = ConfigSchema.parse(input)
      assertEquals(result, { profileAliases: new Map() })
    })
  })

  describe('invalid inputs', () => {
    it('should reject invalid profileAliases', () => {
      const input = {
        profileAliases: 'foobar',
      }
      assertThrows(
        () => ConfigSchema.parse(input),
        z.core.$ZodError,
      )
    })
  })
})

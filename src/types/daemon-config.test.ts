import { assertEquals, assertThrows } from '@std/assert'
import { describe, it } from '@std/testing/bdd'
import { z } from '@zod/zod/mini'
import { DaemonConfigSchema } from './daemon-config.ts'

describe('DaemonConfigSchema', () => {
  describe('valid inputs', () => {
    it('should accept empty object', () => {
      const result = DaemonConfigSchema.parse({})
      assertEquals(result, {})
    })

    it('should accept object with empty profileAliases (partial record)', () => {
      const input = { profileAliases: {} }
      const result = DaemonConfigSchema.parse(input)
      assertEquals(result, { profileAliases: {} })
    })

    it('should accept object with valid profileAliases', () => {
      const input = {
        profileAliases: {
          'Default': ['main', 'default'],
          'Profile 2': ['work'],
        },
      }
      const result = DaemonConfigSchema.parse(input)
      assertEquals(result, input)
    })

    it('should accept profileAliases with Default and Profile N keys', () => {
      const input = {
        profileAliases: {
          'Default': ['d'],
          'Profile 1': ['p1'],
          'Profile 10': ['p10'],
          'Profile 999': ['p999'],
        },
      }
      const result = DaemonConfigSchema.parse(input)
      assertEquals(result, input)
    })

    it('should ignore unknown additional properties (strip)', () => {
      const input = {
        profileAliases: {},
        unknownField: 'value',
        anotherField: 123,
      }
      const result = DaemonConfigSchema.parse(input)
      assertEquals(result, { profileAliases: {} })
    })
  })

  describe('invalid inputs', () => {
    it('should reject invalid profile key: Profile 0', () => {
      const input = {
        profileAliases: {
          'Profile 0': ['zero'],
        },
      }
      assertThrows(
        () => DaemonConfigSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject invalid profile key: lowercase profile', () => {
      const input = {
        profileAliases: {
          'profile 1': ['lowercase'],
        },
      }
      assertThrows(
        () => DaemonConfigSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject invalid profile key: Profile without number', () => {
      const input = {
        profileAliases: {
          'Profile': ['nonum'],
        },
      }
      assertThrows(
        () => DaemonConfigSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject invalid value type: string instead of array', () => {
      const input = {
        profileAliases: {
          'Default': 'not-an-array',
        },
      }
      assertThrows(
        () => DaemonConfigSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject invalid value type: number instead of array', () => {
      const input = {
        profileAliases: {
          'Default': 123,
        },
      }
      assertThrows(
        () => DaemonConfigSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject invalid value type: array of non-strings', () => {
      const input = {
        profileAliases: {
          'Default': [1, 2, 3],
        },
      }
      assertThrows(
        () => DaemonConfigSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject empty array', () => {
      const input = {
        profileAliases: {
          'Default': [],
        },
      }
      assertThrows(
        () => DaemonConfigSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject array containing empty string', () => {
      const input = {
        profileAliases: {
          'Default': ['valid', '', 'another'],
        },
      }
      assertThrows(
        () => DaemonConfigSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject array with only empty string', () => {
      const input = {
        profileAliases: {
          'Default': [''],
        },
      }
      assertThrows(
        () => DaemonConfigSchema.parse(input),
        z.core.$ZodError,
      )
    })
  })
})

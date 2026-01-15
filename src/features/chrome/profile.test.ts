import { assertEquals, assertThrows } from '@std/assert'
import { describe, it } from '@std/testing/bdd'
import { z } from '@zod/zod/mini'
import { ProfileAliasMapSchema, ProfileSchema } from './profile.ts'

describe('ProfileSchema', () => {
  describe('valid formats', () => {
    it('should accept "Default"', () => {
      const result = ProfileSchema.safeParse('Default')
      assertEquals(result.success, true)
      if (result.success) {
        assertEquals(result.data, 'Default')
      }
    })

    it('should accept "Profile 1"', () => {
      const result = ProfileSchema.safeParse('Profile 1')
      assertEquals(result.success, true)
      if (result.success) {
        assertEquals(result.data, 'Profile 1')
      }
    })

    it('should accept "Profile 2"', () => {
      const result = ProfileSchema.safeParse('Profile 2')
      assertEquals(result.success, true)
      if (result.success) {
        assertEquals(result.data, 'Profile 2')
      }
    })

    it('should accept "Profile 10"', () => {
      const result = ProfileSchema.safeParse('Profile 10')
      assertEquals(result.success, true)
      if (result.success) {
        assertEquals(result.data, 'Profile 10')
      }
    })
  })

  describe('invalid formats', () => {
    it('should reject "Profile 0"', () => {
      const result = ProfileSchema.safeParse('Profile 0')
      assertEquals(result.success, false)
    })

    it('should reject lowercase "profile 1"', () => {
      const result = ProfileSchema.safeParse('profile 1')
      assertEquals(result.success, false)
    })

    it('should reject "Profile" without number', () => {
      const result = ProfileSchema.safeParse('Profile')
      assertEquals(result.success, false)
    })

    it('should reject "InvalidProfile"', () => {
      const result = ProfileSchema.safeParse('InvalidProfile')
      assertEquals(result.success, false)
    })

    it('should reject empty string', () => {
      const result = ProfileSchema.safeParse('')
      assertEquals(result.success, false)
    })

    it('should reject lowercase "default"', () => {
      const result = ProfileSchema.safeParse('default')
      assertEquals(result.success, false)
    })

    it('should reject uppercase "PROFILE 1"', () => {
      const result = ProfileSchema.safeParse('PROFILE 1')
      assertEquals(result.success, false)
    })
  })
})

describe('ProfileAliasMapSchema', () => {
  describe('valid inputs', () => {
    it('should accept empty object (partial record)', () => {
      const result = ProfileAliasMapSchema.parse({})
      assertEquals(result, new Map())
    })

    it('should accept object with valid entries', () => {
      const input = {
        'Default': ['main', 'default'],
        'Profile 2': ['work'],
      }
      const result = ProfileAliasMapSchema.parse(input)
      const expected = new Map([
        ['main', 'Default'],
        ['default', 'Default'],
        ['work', 'Profile 2'],
      ])
      assertEquals(result, expected)
    })

    it('should accept entries with Default and Profile N keys', () => {
      const input = {
        'Default': ['d'],
        'Profile 1': ['p1'],
        'Profile 10': ['p10'],
        'Profile 999': ['p999'],
      }
      const result = ProfileAliasMapSchema.parse(input)
      const expected = new Map([
        ['d', 'Default'],
        ['p1', 'Profile 1'],
        ['p10', 'Profile 10'],
        ['p999', 'Profile 999'],
      ])
      assertEquals(result, expected)
    })
  })

  describe('invalid inputs', () => {
    it('should reject invalid profile key: Profile 0', () => {
      const input = {
        'Profile 0': ['zero'],
      }
      assertThrows(
        () => ProfileAliasMapSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject invalid profile key: lowercase profile', () => {
      const input = {
        'profile 1': ['lowercase'],
      }
      assertThrows(
        () => ProfileAliasMapSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject invalid profile key: Profile without number', () => {
      const input = {
        'Profile': ['nonum'],
      }
      assertThrows(
        () => ProfileAliasMapSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject invalid value type: string instead of array', () => {
      const input = {
        'Default': 'not-an-array',
      }
      assertThrows(
        () => ProfileAliasMapSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject invalid value type: number instead of array', () => {
      const input = {
        'Default': 123,
      }
      assertThrows(
        () => ProfileAliasMapSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject invalid value type: array of non-strings', () => {
      const input = {
        'Default': [1, 2, 3],
      }
      assertThrows(
        () => ProfileAliasMapSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject empty array', () => {
      const input = {
        'Default': [],
      }
      assertThrows(
        () => ProfileAliasMapSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject array containing empty string', () => {
      const input = {
        'Default': ['valid', '', 'another'],
      }
      assertThrows(
        () => ProfileAliasMapSchema.parse(input),
        z.core.$ZodError,
      )
    })

    it('should reject array with only empty string', () => {
      const input = {
        'Default': [''],
      }
      assertThrows(
        () => ProfileAliasMapSchema.parse(input),
        z.core.$ZodError,
      )
    })
  })
})

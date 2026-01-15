import { assertEquals } from '@std/assert'
import { describe, it } from '@std/testing/bdd'
import { ProfileSchema } from './profile.ts'

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

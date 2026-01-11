import { assertEquals } from '@std/assert'
import { describe, it } from '@std/testing/bdd'
import { ChromeProfileDirectorySchema } from './chrome-profile-directory.ts'

describe('ChromeProfileDirectorySchema', () => {
  describe('valid formats', () => {
    it('should accept "Default"', () => {
      const result = ChromeProfileDirectorySchema.safeParse('Default')
      assertEquals(result.success, true)
      if (result.success) {
        assertEquals(result.data, 'Default')
      }
    })

    it('should accept "Profile 1"', () => {
      const result = ChromeProfileDirectorySchema.safeParse('Profile 1')
      assertEquals(result.success, true)
      if (result.success) {
        assertEquals(result.data, 'Profile 1')
      }
    })

    it('should accept "Profile 2"', () => {
      const result = ChromeProfileDirectorySchema.safeParse('Profile 2')
      assertEquals(result.success, true)
      if (result.success) {
        assertEquals(result.data, 'Profile 2')
      }
    })

    it('should accept "Profile 10"', () => {
      const result = ChromeProfileDirectorySchema.safeParse('Profile 10')
      assertEquals(result.success, true)
      if (result.success) {
        assertEquals(result.data, 'Profile 10')
      }
    })
  })

  describe('invalid formats', () => {
    it('should reject "Profile 0"', () => {
      const result = ChromeProfileDirectorySchema.safeParse('Profile 0')
      assertEquals(result.success, false)
    })

    it('should reject lowercase "profile 1"', () => {
      const result = ChromeProfileDirectorySchema.safeParse('profile 1')
      assertEquals(result.success, false)
    })

    it('should reject "Profile" without number', () => {
      const result = ChromeProfileDirectorySchema.safeParse('Profile')
      assertEquals(result.success, false)
    })

    it('should reject "InvalidProfile"', () => {
      const result = ChromeProfileDirectorySchema.safeParse('InvalidProfile')
      assertEquals(result.success, false)
    })

    it('should reject empty string', () => {
      const result = ChromeProfileDirectorySchema.safeParse('')
      assertEquals(result.success, false)
    })

    it('should reject lowercase "default"', () => {
      const result = ChromeProfileDirectorySchema.safeParse('default')
      assertEquals(result.success, false)
    })

    it('should reject uppercase "PROFILE 1"', () => {
      const result = ChromeProfileDirectorySchema.safeParse('PROFILE 1')
      assertEquals(result.success, false)
    })
  })
})

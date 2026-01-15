import { assertEquals, assertRejects } from '@std/assert'
import { beforeEach, describe, it } from '@std/testing/bdd'
import { ChromeService } from './chrome-service.ts'
import type { ChromeLauncher } from './launcher/launcher.ts'
import type { Profile, ProfileAliasMap } from './profile.ts'

describe('ChromeService', () => {
  let mockLauncher: ChromeLauncher
  let launchCalls: Array<{ profile: string | null; args: string[] }>
  let profileAliasMap: ProfileAliasMap

  beforeEach(() => {
    launchCalls = []
    mockLauncher = {
      launch: (profile: string | null, ...args: string[]) => {
        launchCalls.push({ profile, args })
        return Promise.resolve()
      },
    }

    profileAliasMap = new Map([
      ['work', 'Profile 1'],
      ['personal', 'Profile 2'],
      ['dev', 'Default'],
    ])
  })

  describe('open', () => {
    describe('when profile is null', () => {
      it('should launch Chrome with null profile', async () => {
        const service = new ChromeService(profileAliasMap, mockLauncher)

        await service.open(null, 'https://example.com')

        assertEquals(launchCalls.length, 1)
        assertEquals(launchCalls[0], {
          profile: null,
          args: ['https://example.com'],
        })
      })
    })

    describe('when profile alias is provided', () => {
      it('should resolve alias to profile and launch Chrome', async () => {
        const service = new ChromeService(profileAliasMap, mockLauncher)

        await service.open('work', 'https://example.com')

        assertEquals(launchCalls.length, 1)
        assertEquals(launchCalls[0], {
          profile: 'Profile 1',
          args: ['https://example.com'],
        })
      })

      it('should resolve alias to Default profile', async () => {
        const service = new ChromeService(profileAliasMap, mockLauncher)

        await service.open('dev', 'https://example.com')

        assertEquals(launchCalls.length, 1)
        assertEquals(launchCalls[0], {
          profile: 'Default',
          args: ['https://example.com'],
        })
      })
    })

    describe('when profile name is directly provided', () => {
      it('should launch Chrome with the specified profile', async () => {
        const service = new ChromeService(profileAliasMap, mockLauncher)

        await service.open('Profile 3', 'https://example.com')

        assertEquals(launchCalls.length, 1)
        assertEquals(launchCalls[0], {
          profile: 'Profile 3',
          args: ['https://example.com'],
        })
      })

      it('should launch Chrome with Default profile', async () => {
        const service = new ChromeService(profileAliasMap, mockLauncher)

        await service.open('Default', 'https://example.com')

        assertEquals(launchCalls.length, 1)
        assertEquals(launchCalls[0], {
          profile: 'Default',
          args: ['https://example.com'],
        })
      })
    })

    describe('when invalid profile name is provided', () => {
      it('should throw validation error for invalid profile format', async () => {
        const service = new ChromeService(profileAliasMap, mockLauncher)

        await assertRejects(
          () => service.open('Profile 0' as Profile, 'https://example.com'),
          Error,
        )

        assertEquals(launchCalls.length, 0)
      })

      it('should throw validation error for malformed profile name', async () => {
        const service = new ChromeService(profileAliasMap, mockLauncher)

        await assertRejects(
          () => service.open('InvalidProfile' as Profile, 'https://example.com'),
          Error,
        )

        assertEquals(launchCalls.length, 0)
      })
    })

    describe('when multiple arguments are provided', () => {
      it('should pass all arguments to launcher', async () => {
        const service = new ChromeService(profileAliasMap, mockLauncher)

        await service.open('work', 'https://example.com', '--new-window', '--incognito')

        assertEquals(launchCalls.length, 1)
        assertEquals(launchCalls[0], {
          profile: 'Profile 1',
          args: ['https://example.com', '--new-window', '--incognito'],
        })
      })

      it('should work with no additional arguments', async () => {
        const service = new ChromeService(profileAliasMap, mockLauncher)

        await service.open('personal')

        assertEquals(launchCalls.length, 1)
        assertEquals(launchCalls[0], {
          profile: 'Profile 2',
          args: [],
        })
      })
    })

    describe('when launcher throws an error', () => {
      it('should propagate the error', async () => {
        const error = new Error('Launch failed')
        mockLauncher = {
          launch: (_profile: string | null, ..._args: string[]) => Promise.reject(error),
        }

        const service = new ChromeService(profileAliasMap, mockLauncher)

        await assertRejects(
          () => service.open('work', 'https://example.com'),
          Error,
          'Launch failed',
        )
      })
    })

    describe('with empty profile alias map', () => {
      it('should work with direct profile names only', async () => {
        const emptyMap = new Map()
        const service = new ChromeService(emptyMap, mockLauncher)

        await service.open('Profile 5', 'https://example.com')

        assertEquals(launchCalls.length, 1)
        assertEquals(launchCalls[0], {
          profile: 'Profile 5',
          args: ['https://example.com'],
        })
      })
    })
  })
})

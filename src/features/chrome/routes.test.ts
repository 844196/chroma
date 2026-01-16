import { testClient } from '@hono/hono/testing'
import { TypedContainer } from '@inversifyjs/strongly-typed'
import { assertEquals } from '@std/assert/equals'
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd'
import { assertSpyCalls, restore, Spy, spy } from '@std/testing/mock'
import { BindingMap, Container } from '../../shared/container.ts'
import { chromeRoutes } from './routes.ts'

function createTestClient(container: Container) {
  return testClient(chromeRoutes, { container })
}

describe('chromeRoutes', () => {
  let container: Container
  let client: ReturnType<typeof createTestClient>

  beforeEach(() => {
    container = new TypedContainer<BindingMap>()
    client = createTestClient(container)
  })

  afterEach(() => {
    restore()
  })

  describe('POST /open', () => {
    let openSpy: Spy<unknown, [...unknown[]], Promise<void>>

    beforeEach(() => {
      openSpy = spy(async (..._args: unknown[]) => {})
      container.bind('chromeService').toConstantValue({ open: openSpy })
    })

    describe('without profile', () => {
      it('should respond with 200', async () => {
        const res = await client.open.$post({
          json: {
            args: ['https://example.com'],
          },
        })

        assertEquals(res.status, 200)
        assertSpyCalls(openSpy, 1)
        assertEquals(openSpy.calls[0].args[0], null)
        assertEquals(openSpy.calls[0].args[1], 'https://example.com')
      })
    })

    describe('with profile', () => {
      it('should respond with 200', async () => {
        const res = await client.open.$post({
          json: {
            args: ['https://example.com'],
            profile: 'Profile 1',
          },
        })

        assertEquals(res.status, 200)
        assertSpyCalls(openSpy, 1)
        assertEquals(openSpy.calls[0].args[0], 'Profile 1')
        assertEquals(openSpy.calls[0].args[1], 'https://example.com')
      })
    })

    describe('with profile alias', () => {
      it('should respond with 200', async () => {
        const res = await client.open.$post({
          json: {
            args: ['https://example.com'],
            profile: 'home',
          },
        })

        assertEquals(res.status, 200)
        assertSpyCalls(openSpy, 1)
        assertEquals(openSpy.calls[0].args[0], 'home')
        assertEquals(openSpy.calls[0].args[1], 'https://example.com')
      })
    })

    describe('with extra args', () => {
      it('should respond with 200', async () => {
        const res = await client.open.$post({
          json: {
            args: ['--new-window', 'https://example.com'],
            profile: 'Profile 2',
          },
        })

        assertEquals(res.status, 200)
        assertSpyCalls(openSpy, 1)
        assertEquals(openSpy.calls[0].args[0], 'Profile 2')
        assertEquals(openSpy.calls[0].args[1], '--new-window')
        assertEquals(openSpy.calls[0].args[2], 'https://example.com')
      })
    })
  })
})

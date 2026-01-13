import { assertEquals, assertRejects } from '@std/assert'
import { afterEach, describe, it } from '@std/testing/bdd'
import { restore, stub } from '@std/testing/mock'
import { z } from '@zod/zod/mini'
import { readConfig } from './read-config.ts'

describe('readConfig', () => {
  afterEach(() => {
    restore()
  })

  describe('when given valid JSON', () => {
    it('should read and parse the file with schema', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })

      stub(Deno, 'readTextFile', () => Promise.resolve('{"name":"Alice","age":30}'))

      const result = await readConfig('/path/to/config.json', schema)
      assertEquals(result, { name: 'Alice', age: 30 })
    })

    it('should handle empty object', async () => {
      const schema = z.object({})

      stub(Deno, 'readTextFile', () => Promise.resolve('{}'))

      const result = await readConfig('/path/to/config.json', schema)
      assertEquals(result, {})
    })

    it('should handle complex nested schema', async () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          settings: z.object({
            theme: z.string(),
          }),
        }),
        items: z.array(z.number()),
      })

      stub(
        Deno,
        'readTextFile',
        () => Promise.resolve('{"user":{"name":"Charlie","settings":{"theme":"dark"}},"items":[1,2,3]}'),
      )

      const result = await readConfig('/path/to/config.json', schema)
      assertEquals(result, {
        user: {
          name: 'Charlie',
          settings: {
            theme: 'dark',
          },
        },
        items: [1, 2, 3],
      })
    })
  })

  describe('when given invalid JSON', () => {
    it('should throw SyntaxError', async () => {
      const schema = z.object({ name: z.string() })

      stub(Deno, 'readTextFile', () => Promise.resolve('invalid json'))

      await assertRejects(
        () => readConfig('/path/to/config.json', schema),
        SyntaxError,
      )
    })
  })

  describe('when schema validation fails', () => {
    it('should throw ZodError', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })

      stub(Deno, 'readTextFile', () => Promise.resolve('{"name":"Bob","age":"not a number"}'))

      await assertRejects(
        () => readConfig('/path/to/config.json', schema),
        z.core.$ZodError,
      )
    })
  })

  describe('file path handling', () => {
    it('should pass the correct path to Deno.readTextFile', async () => {
      const schema = z.object({ value: z.string() })
      let capturedPath: string | undefined

      stub(Deno, 'readTextFile', (path: string | URL) => {
        capturedPath = path.toString()
        return Promise.resolve('{"value":"test"}')
      })

      await readConfig('/custom/path/config.json', schema)
      assertEquals(capturedPath, '/custom/path/config.json')
    })
  })
})

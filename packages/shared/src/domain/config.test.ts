import { describe, expect, it } from '@effect/vitest'
import { JSONSchema } from 'effect'
import { ConfigSchema } from './config.ts'

describe('ConfigSchema', () => {
  describe('JSON Schema', () => {
    it('profileAliasesのpropertyNamesがProfileNameのUnion全体を反映すること', () => {
      const schema = JSONSchema.make(ConfigSchema) as unknown as {
        properties: { profileAliases: { propertyNames: unknown } }
      }
      const propertyNames = schema.properties.profileAliases.propertyNames

      expect(propertyNames).toStrictEqual({
        anyOf: [
          { const: 'Default', description: 'Default Chrome profile' },
          {
            type: 'string',
            pattern: '^Profile [1-9][0-9]*$',
            description: 'Non-default Chrome profile directory name (e.g. "Profile 1")',
          },
        ],
        description: 'Chrome profile directory name ("Default" or "Profile N")',
      })
    })
  })
})

import { mkdirSync, writeFileSync } from 'node:fs'
import { JSONSchema } from 'effect'
import { ConfigSchema } from '../src/domain/config.ts'

const schema = JSONSchema.make(ConfigSchema)

mkdirSync('dist/schemas', { recursive: true })
writeFileSync('dist/schemas/config.json', `${JSON.stringify(schema, null, 2)}\n`)

import { z } from '@zod/zod/mini'

export const ChromeProfileDirectorySchema = z.union([
  z.literal('Default'),
  z.templateLiteral([z.literal('Profile '), z.number()])
    .check(z.refine((v) => /^Profile [1-9]\d*$/.test(v))),
])

export type ChromeProfileDirectory = z.infer<typeof ChromeProfileDirectorySchema>

import { z } from '@zod/zod/mini'

/**
 * Chromeプロファイルディレクトリ名のZodスキーマ
 */
export const ChromeProfileDirectorySchema = z.union([
  z.literal('Default'),
  z.templateLiteral([z.literal('Profile '), z.number()])
    .check(z.refine((v) => /^Profile [1-9][0-9]*$/.test(v))),
])

/**
 * Chromeプロファイルディレクトリ名の型
 */
export type ChromeProfileDirectory = z.infer<typeof ChromeProfileDirectorySchema>

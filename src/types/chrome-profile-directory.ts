import { z } from '@zod/zod/mini'

/**
 * Chromeプロファイルディレクトリ名の型
 * - "Default" (デフォルトプロファイル)
 * - "Profile 1", "Profile 2", ... (追加プロファイル、1以上の整数)
 */
export type ChromeProfileDirectory = 'Default' | `Profile ${number}`

/**
 * Chromeプロファイルディレクトリ名のZodスキーマ
 *
 * 有効なフォーマット:
 * - "Default" (デフォルトプロファイル)
 * - "Profile 1", "Profile 2", ... (追加プロファイル、1以上の整数)
 *
 * 注: "Profile 0" は無効です。Chromeは追加プロファイルを1から始めます。
 *
 * @see https://zod.dev/api?id=custom
 */
export const ChromeProfileDirectorySchema = z.custom<ChromeProfileDirectory>(
  (value) => {
    if (typeof value !== 'string') return false
    // "Default" または "Profile <1以上の整数>"
    return value === 'Default' || /^Profile [1-9]\d*$/.test(value)
  },
  {
    message:
      'Invalid Chrome profile directory name. Must be "Default" or "Profile <positive integer>" (e.g., "Profile 1", "Profile 2"). "Profile 0" is not valid.',
  },
)

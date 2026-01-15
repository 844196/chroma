import { z } from '@zod/zod/mini'

export const ProfileSchema = z.union([
  z.literal('Default'),
  z.templateLiteral([z.literal('Profile '), z.number()])
    .check(z.refine((v) => /^Profile [1-9]\d*$/.test(v))),
])

export type Profile = z.infer<typeof ProfileSchema>

export const ProfileAliasSchema = z.string().check(z.minLength(1))

export type ProfileAlias = z.infer<typeof ProfileAliasSchema>

export const ProfileAliasMapSchema = z.codec(
  z.partialRecord(ProfileSchema, z.array(ProfileAliasSchema).check(z.minLength(1))),
  // アプリから参照するときに使いやすい形に変換する
  z.map(ProfileAliasSchema, ProfileSchema),
  {
    decode: (record) => {
      const map = new Map<ProfileAlias, Profile>()
      for (const [profile, aliases] of Object.entries(record)) {
        for (const alias of aliases ?? []) {
          map.set(alias, profile as Profile)
        }
      }
      return map
    },
    encode: (map) => {
      const record: Partial<Record<Profile, ProfileAlias[]>> = {}
      for (const [alias, profile] of map.entries()) {
        record[profile] ??= []
        record[profile].push(alias)
      }
      return record
    },
  },
)

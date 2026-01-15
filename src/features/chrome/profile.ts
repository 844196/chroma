import { z } from '@zod/zod/mini'

export const ProfileSchema = z.union([
  z.literal('Default'),
  z.templateLiteral([z.literal('Profile '), z.number()])
    .check(z.refine((v) => /^Profile [1-9][0-9]*$/.test(v))),
])
export type Profile = z.infer<typeof ProfileSchema>

export const ProfileAliasSchema = z.string().check(z.minLength(1))
export type ProfileAlias = z.infer<typeof ProfileAliasSchema>

export const ProfileAliasMapSchema = z.codec(
  z.partialRecord(ProfileSchema, z.array(ProfileAliasSchema).check(z.minLength(1))),
  z.readonly(z.map(ProfileAliasSchema, ProfileSchema)),
  {
    decode: (record) => {
      const acc = new Map<ProfileAlias, Profile>()
      for (const [profile, aliases] of Object.entries(record)) {
        for (const alias of aliases ?? []) {
          acc.set(alias, profile as Profile)
        }
      }
      return acc
    },
    encode: (map) => {
      const acc: Partial<Record<Profile, ProfileAlias[]>> = {}
      for (const [alias, profile] of map.entries()) {
        acc[profile] ??= []
        acc[profile].push(alias)
      }
      return acc
    },
  },
)
export type ProfileAliasMap = z.infer<typeof ProfileAliasMapSchema>

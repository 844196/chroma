import { ParseResult, Schema } from 'effect'
import { ProfileName } from './profile-name.ts'

const ProfileNameAliasMap = Schema.transformOrFail(
  Schema.partial(Schema.Record({ key: ProfileName, value: Schema.NonEmptyArray(Schema.NonEmptyString) })),
  Schema.ReadonlyMap({ key: Schema.NonEmptyString, value: ProfileName }),
  {
    strict: true,
    decode: (record) => {
      const acc: Array<[string, ProfileName]> = []
      for (const [profile, aliases] of Object.entries(record)) {
        for (const alias of aliases ?? []) {
          acc.push([alias, profile as ProfileName])
        }
      }
      return ParseResult.succeed(acc)
    },
    encode: (entries, _, ast) => ParseResult.fail(new ParseResult.Forbidden(ast, entries, 'Not supported')),
  },
)

export const Config = Schema.Struct({
  profileNameAliases: Schema.optionalWith(ProfileNameAliasMap, {
    default: () => new Map(),
  }),
})

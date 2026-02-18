import { Context, ParseResult, Schema } from 'effect'
import { ProfileName } from './profile-name.ts'

const PathMapping = Schema.transformOrFail(
  Schema.Record({ key: Schema.NonEmptyString, value: Schema.NonEmptyString }),
  Schema.ReadonlyMap({ key: Schema.NonEmptyString, value: Schema.NonEmptyString }),
  {
    strict: true,
    decode: (record) =>
      ParseResult.succeed(Object.entries(record).toSorted(([left], [right]) => right.length - left.length)),
    encode: (entries, _, ast) => ParseResult.fail(new ParseResult.Forbidden(ast, entries, 'Not supported')),
  },
)

const ProfileNameAliasMap = Schema.transformOrFail(
  Schema.partial(Schema.Record({ key: ProfileName, value: Schema.NonEmptyArray(Schema.NonEmptyString) })).annotations({
    jsonSchema: {
      propertyNames: {
        anyOf: [
          { const: 'Default', description: 'Default Chrome profile' },
          {
            type: 'string',
            pattern: '^Profile [1-9][0-9]*$',
            description: 'Non-default Chrome profile directory name (e.g. "Profile 1")',
          },
        ],
        description: 'Chrome profile directory name ("Default" or "Profile N")',
      },
    },
  }),
  Schema.ReadonlyMap({ key: Schema.NonEmptyString, value: ProfileName }),
  {
    strict: true,
    decode: (record) =>
      ParseResult.succeed(
        Object.entries(record).flatMap(([profile, aliases]) =>
          (aliases ?? []).map((alias) => [alias, profile as ProfileName] as const),
        ),
      ),
    encode: (entries, _, ast) => ParseResult.fail(new ParseResult.Forbidden(ast, entries, 'Not supported')),
  },
)

export const ConfigSchema = Schema.Struct({
  profileAliases: Schema.optionalWith(ProfileNameAliasMap, {
    default: () => new Map(),
  }).annotations({
    description: 'Mapping from Chrome profile directory name to its aliases',
  }),
  paths: Schema.optionalWith(PathMapping, {
    default: () => new Map(),
  }).annotations({
    description: 'Mapping from path prefix to Chrome profile name or alias (longest prefix match)',
  }),
}).annotations({
  description: 'chroma configuration file schema',
  jsonSchema: { additionalProperties: true },
})

export class Config extends Context.Tag('@chroma/shared/domain/Config')<Config, typeof ConfigSchema.Type>() {}

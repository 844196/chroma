import { homedir } from 'node:os'
import { join as joinPath } from 'node:path'
import { ProfileName } from '@chroma/server'
import { FileSystem } from '@effect/platform'
import { Context, Effect, Either, Layer, Option, ParseResult, pipe, Schema } from 'effect'

const ProfileNameAliasMapSchema = Schema.transformOrFail(
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

const AppConfigSchema = Schema.Struct({
  profileNameAliases: Schema.optionalWith(ProfileNameAliasMapSchema, {
    default: () => new Map(),
  }),
})

export const DEFAULT_APP_CONFIG: typeof AppConfigSchema.Type = {
  profileNameAliases: new Map(),
}

export class AppConfig extends Context.Tag('AppConfig')<AppConfig, typeof AppConfigSchema.Type>() {
  static readonly layer = (specifiedConfigPath: Option.Option<string>) =>
    Layer.effect(
      AppConfig,
      Effect.gen(function* () {
        const configPath = Option.getOrElse(specifiedConfigPath, () =>
          joinPath(`${process.env.XDG_CONFIG_HOME ?? joinPath(homedir(), '.config')}`, 'chroma', 'config.json'),
        )

        const fs = yield* FileSystem.FileSystem

        const fileContentResult = yield* Effect.either(fs.readFileString(configPath))
        if (Either.isLeft(fileContentResult)) {
          return Option.isNone(specifiedConfigPath)
            ? DEFAULT_APP_CONFIG
            : yield* new AppConfigFileReadError({ configPath, cause: fileContentResult.left })
        }

        const config = yield* pipe(
          fileContentResult.right,
          Schema.decode(Schema.parseJson(AppConfigSchema)),
          Effect.mapError((cause) => new AppConfigFileParseError({ cause })),
        )

        return config
      }),
    )
}

export class AppConfigFileReadError extends Schema.TaggedError<AppConfigFileReadError>()('AppConfigFileReadError', {
  configPath: Schema.String,
  cause: Schema.Defect,
}) {}

export class AppConfigFileParseError extends Schema.TaggedError<AppConfigFileParseError>()('AppConfigFileParseError', {
  cause: Schema.Defect,
}) {}

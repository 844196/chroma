import { homedir } from 'node:os'
import { join as joinPath } from 'node:path'
import { FileSystem } from '@effect/platform'
import { Context, Effect, Either, Layer, Option, pipe, Schema } from 'effect'
import { Config as ConfigSchema } from '../schemas/config.ts'

const DEFAULT_CONFIG: typeof ConfigSchema.Type = {
  profileAliases: new Map(),
}

const DEFAULT_CONFIG_PATH = Option.fromNullable(process.env.XDG_CONFIG_HOME).pipe(
  Option.getOrElse(() => joinPath(homedir(), '.config')),
  ($) => joinPath($, 'chroma', 'config.json'),
)

export class Config extends Context.Tag('@chroma/shared/externals/Config')<Config, typeof ConfigSchema.Type>() {
  static readonly layer = (opts: { path?: string | undefined } = {}) =>
    Layer.effect(
      Config,
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem

        const path = opts.path ?? DEFAULT_CONFIG_PATH
        const isSpecifiedPath = opts.path !== undefined

        const fileContentResult = yield* Effect.either(fs.readFileString(path))
        if (Either.isLeft(fileContentResult)) {
          return isSpecifiedPath
            ? yield* new ConfigFileReadError({ path, cause: fileContentResult.left })
            : DEFAULT_CONFIG
        }

        const config = yield* pipe(
          fileContentResult.right,
          Schema.decode(Schema.parseJson(ConfigSchema)),
          Effect.mapError((cause) => new ConfigFileParseError({ cause })),
        )

        return config
      }),
    )
}

export class ConfigFileReadError extends Schema.TaggedError<ConfigFileReadError>()('ConfigFileReadError', {
  path: Schema.String,
  cause: Schema.Defect,
}) {}

export class ConfigFileParseError extends Schema.TaggedError<ConfigFileParseError>()('ConfigFileParseError', {
  cause: Schema.Defect,
}) {}

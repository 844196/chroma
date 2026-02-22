import { Schema } from 'effect'

/**
 * 不正なプロファイル名
 */
export class InvalidProfileNameError extends Schema.TaggedError<InvalidProfileNameError>()('InvalidProfileNameError', {
  givenName: Schema.String,
}) {}

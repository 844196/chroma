import { Schema } from 'effect'

export class InvalidProfileNameError extends Schema.TaggedError<InvalidProfileNameError>()('InvalidProfileNameError', {
  givenName: Schema.String,
}) {}

import { Schema } from 'effect'

export class ChromeLaunchError extends Schema.TaggedError<ChromeLaunchError>()('ChromeLaunchError', {
  exitCode: Schema.Number.pipe(Schema.int()),
  stdout: Schema.String,
  stderr: Schema.String,
}) {}

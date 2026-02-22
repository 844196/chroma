import { Schema } from 'effect'

/**
 * Chrome起動の失敗（外部コマンドの非ゼロ終了）
 */
export class ChromeLaunchError extends Schema.TaggedError<ChromeLaunchError>()('ChromeLaunchError', {
  exitCode: Schema.Number.pipe(Schema.int()),
  stdout: Schema.String,
  stderr: Schema.String,
}) {}

import type { Command } from '@effect/platform'
import { Context, type Effect, Schema } from 'effect'

/**
 * Chrome起動コマンドを実行する
 *
 * @see CommandFactory
 */
export class CommandExecutor extends Context.Tag('@chroma/server/domain/CommandExecutor')<
  CommandExecutor,
  {
    /**
     * Chrome起動コマンドを実行する
     *
     * コマンドの性質上、起動コマンドの終了コードが0であることをもって成功とみなし、それ以外の場合は失敗 (`CommandFailedError`) とみなす
     * 起動コマンドがそもそも `PATH` にない、実行権限がない等の理由でコマンド自体の実行に失敗した場合はdie扱いとする
     */
    readonly exec: (cmd: Command.Command) => Effect.Effect<void, CommandFailedError>
  }
>() {}

/**
 * Chrome起動コマンドが異常終了したことを表すエラー
 */
export class CommandFailedError extends Schema.TaggedError<CommandFailedError>()('CommandFailedError', {
  exitCode: Schema.Number.pipe(Schema.int()),
  stdout: Schema.String,
  stderr: Schema.String,
}) {}

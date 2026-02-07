import { type Command, CommandExecutor as PlatformCommandExecutor } from '@effect/platform'
import { Context, Effect, String as EffectString, Layer, pipe, Schema, Stream } from 'effect'

/**
 * Chrome起動コマンドを実行する
 *
 * @see \@chroma/server/adapter/CommandFactory
 */
export class CommandExecutor extends Context.Tag('@chroma/server/infrastructure/CommandExecutor')<
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
>() {
  static readonly layer = Layer.effect(
    CommandExecutor,
    Effect.gen(function* () {
      const platformCommandExecutor = yield* PlatformCommandExecutor.CommandExecutor

      const exec = Effect.fn('CommandExecutor.exec')(function* (cmd: Command.Command) {
        const run = pipe(
          platformCommandExecutor.start(cmd),
          Effect.flatMap(({ exitCode, stdout, stderr }) =>
            Effect.all([exitCode, decodeStream(stdout), decodeStream(stderr)], { concurrency: 3 }),
          ),
          Effect.catchAll(Effect.die),
          Effect.filterOrFail(
            ([exitCode]) => exitCode === 0,
            ([exitCode, stdout, stderr]) => new CommandFailedError({ exitCode, stdout, stderr }),
          ),
        )

        yield* Effect.scoped(run)
      })

      return { exec }
    }),
  )
}

/**
 * Chrome起動コマンドが異常終了したことを表すエラー
 */
export class CommandFailedError extends Schema.TaggedError<CommandFailedError>()('CommandFailedError', {
  exitCode: Schema.Number.pipe(Schema.int()),
  stdout: Schema.String,
  stderr: Schema.String,
}) {}

function decodeStream<E, R>(stream: Stream.Stream<Uint8Array, E, R>): Effect.Effect<string, E, R> {
  return stream.pipe(Stream.decodeText(), Stream.runFold(EffectString.empty, EffectString.concat))
}

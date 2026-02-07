import type { ProfileName } from '@chroma/shared/domain'
import type { Command } from '@effect/platform'
import { Context, type Effect, type Option } from 'effect'

/**
 * Chrome起動コマンドを生成する
 *
 * OSごとに異なる起動コマンド、コマンドライン引数、エスケープ処理を吸収する
 */
export class CommandFactory extends Context.Tag('@chroma/server/use-case/launch-chrome/CommandFactory')<
  CommandFactory,
  {
    /**
     * Chrome起動コマンドを生成する
     */
    readonly create: (
      profileName: Option.Option<ProfileName>,
      url: Option.Option<string>,
    ) => Effect.Effect<Command.Command>
  }
>() {}

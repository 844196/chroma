import { tmpdir, userInfo } from 'node:os'
import { join as joinPath } from 'node:path'
import { Context, Effect, Layer, Option } from 'effect'

export class RuntimeDir extends Context.Tag('@chroma/shared/infrastructure/RuntimeDir')<RuntimeDir, string>() {
  static readonly layer = Layer.effect(
    RuntimeDir,
    Effect.sync(() =>
      Option.fromNullable(process.env.CHROMA_RUNTIME_DIR).pipe(
        Option.orElse(() =>
          Option.map(Option.fromNullable(process.env.XDG_RUNTIME_DIR), (dir) => joinPath(dir, 'chroma')),
        ),
        Option.getOrElse(() => joinPath(tmpdir(), `chroma-${userInfo().uid}`)),
      ),
    ),
  )
}

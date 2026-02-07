import { tmpdir, userInfo } from 'node:os'
import { join as joinPath } from 'node:path'
import { Context, Effect, Layer, Option as O } from 'effect'

export class RuntimeDir extends Context.Tag('@chroma/shared/infrastructure/RuntimeDir')<RuntimeDir, string>() {
  static readonly layer = Layer.effect(
    RuntimeDir,
    Effect.sync(() =>
      O.fromNullable(process.env.CHROMA_RUNTIME_DIR).pipe(
        O.orElse(() => O.map(O.fromNullable(process.env.XDG_RUNTIME_DIR), (dir) => joinPath(dir, 'chroma'))),
        O.getOrElse(() => joinPath(tmpdir(), `chroma-${userInfo().uid}`)),
      ),
    ),
  )
}

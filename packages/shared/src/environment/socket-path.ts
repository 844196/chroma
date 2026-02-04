import { join as joinPath } from 'node:path'
import { Context, Effect, Layer } from 'effect'
import { RuntimeDir } from './runtime-dir'

export class SocketPath extends Context.Tag('@chroma/shared/environment/SocketPath')<SocketPath, string>() {
  static readonly layerWithoutDependencies = Layer.effect(
    SocketPath,
    Effect.map(RuntimeDir, (dir) => joinPath(dir, 'chroma.sock')),
  )

  static readonly layer = SocketPath.layerWithoutDependencies.pipe(Layer.provide(RuntimeDir.layer))
}

import { z } from '@zod/zod/mini'

export async function readConfig<T extends z.ZodMiniType>(path: string, schema: T): Promise<z.infer<T>> {
  return schema.parse(JSON.parse(await Deno.readTextFile(path)))
}

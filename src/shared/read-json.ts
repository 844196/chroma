import { z } from '@zod/zod/mini'

export async function readJson<T extends z.ZodMiniType>(path: string, schema: T): Promise<z.infer<T>> {
  const text = await Deno.readTextFile(path)
  return schema.parse(JSON.parse(text))
}

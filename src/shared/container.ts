import { TypedContainer } from '@inversifyjs/strongly-typed'
import type { ChromeService } from '../features/chrome/chrome-service.ts'

// HACK: https://stackoverflow.com/a/60390007
type PublicInterface<T> = {
  [K in keyof T]: T[K]
}

export type BindingMap = {
  chromeService: PublicInterface<ChromeService>
}

export const container = new TypedContainer<BindingMap>()

export type Container = TypedContainer<BindingMap>

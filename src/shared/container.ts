import { TypedContainer } from '@inversifyjs/strongly-typed'
import type { ChromeService } from '../features/chrome/chrome-service.ts'

type BindingMap = {
  chromeService: ChromeService
}

export const container = new TypedContainer<BindingMap>()

export type Container = typeof container

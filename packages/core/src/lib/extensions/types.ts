import { ServiceContainer } from '../core/container'
import { LuckmdRegistry } from '../types'

export interface ExtensionContext {
  container: ServiceContainer
  registry: LuckmdRegistry
}

export interface Extension {
  id: string
  activate(ctx: ExtensionContext): Promise<void> | void
  deactivate?(ctx: ExtensionContext): Promise<void> | void
}



export class ServiceContainer {
  private map = new Map<string, any>()

  set<T>(token: string, instance: T) {
    this.map.set(token, instance)
  }

  get<T>(token: string): T {
    const v = this.map.get(token)
    if (!v) throw new Error(`Service not found: ${token}`)
    return v as T
  }
}

export const TOKENS = {
  commands: 'commands',
  events: 'events',
  slots: 'slots',
  config: 'config',
  theme: 'theme',
  logger: 'logger',
} as const



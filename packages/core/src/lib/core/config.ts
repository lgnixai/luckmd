export interface ConfigStore {
  get<T = any>(key: string, def?: T): T | undefined
  set<T = any>(key: string, val: T): void
}

export class MemoryConfig implements ConfigStore {
  private data = new Map<string, any>()
  get<T = any>(key: string, def?: T) { return this.data.get(key) ?? def }
  set<T = any>(key: string, val: T) { this.data.set(key, val) }
}

export interface ThemeManager { current(): string; set(theme: string): void }
export class SimpleTheme implements ThemeManager {
  private name = 'light'
  current() { return this.name }
  set(theme: string) { this.name = theme }
}

export interface Logger { info(...a: any[]): void; warn(...a: any[]): void; error(...a: any[]): void }
export const ConsoleLogger: Logger = console



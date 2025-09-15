export type EventHandler<T = any> = (payload: T) => void

export class EventEmitter {
  private listeners = new Map<string, Set<EventHandler>>()

  on<T = any>(event: string, handler: EventHandler<T>) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(handler as EventHandler)
    return () => this.off(event, handler)
  }

  off<T = any>(event: string, handler: EventHandler<T>) {
    this.listeners.get(event)?.delete(handler as EventHandler)
  }

  emit<T = any>(event: string, payload: T) {
    this.listeners.get(event)?.forEach(fn => fn(payload))
  }
}



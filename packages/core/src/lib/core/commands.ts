export type CommandHandler = (args?: any) => Promise<any> | any

export class CommandRegistry {
  private map = new Map<string, CommandHandler>()

  register(id: string, handler: CommandHandler) {
    if (this.map.has(id)) return
    this.map.set(id, handler)
  }

  async execute(id: string, args?: any) {
    const fn = this.map.get(id)
    if (!fn) throw new Error(`Command not found: ${id}`)
    return await fn(args)
  }
}

export const globalCommands = new CommandRegistry()



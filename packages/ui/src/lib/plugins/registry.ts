import { LuckmdPlugin, LuckmdRegistry } from '@luckmd/core';

export class InMemoryRegistry implements LuckmdRegistry {
  private plugins: LuckmdPlugin[] = [];

  register(plugin: LuckmdPlugin): void {
    const exists = this.plugins.some(p => p.id === plugin.id);
    if (exists) return;
    this.plugins.push(plugin);
  }

  all(): LuckmdPlugin[] {
    return this.plugins.slice();
  }
}

export const globalRegistry = new InMemoryRegistry();



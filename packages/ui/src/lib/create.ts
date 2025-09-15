import React from 'react';
import ReactDOM from 'react-dom/client';
import { MultiPaneShell } from './shell/MultiPaneShell';
import { InMemoryRegistry } from './plugins/registry';
import { LuckmdPlugin, Extension, EventEmitter, CommandRegistry, globalSlots, ServiceContainer, TOKENS, ConsoleLogger, MemoryConfig, SimpleTheme } from '@luckmd/core';

export interface CreateOptions {
  plugins?: LuckmdPlugin[] | Promise<LuckmdPlugin[]>;
  defaultLocale?: string;
  defaultTheme?: string;
  extensions?: (Extension | Promise<Extension>)[] | Promise<Extension[]>;
}

export function create(options: CreateOptions = {}) {
  const registry = new InMemoryRegistry();
  const container = new ServiceContainer();
  // core services
  container.set(TOKENS.events, new EventEmitter());
  container.set(TOKENS.commands, new CommandRegistry());
  container.set(TOKENS.slots, globalSlots);
  container.set(TOKENS.config, new MemoryConfig());
  container.set(TOKENS.theme, new SimpleTheme());
  container.set(TOKENS.logger, ConsoleLogger);
  let root: ReactDOM.Root | null = null;

  const ensurePlugins = async () => {
    const list = Array.isArray(options.plugins)
      ? options.plugins
      : options.plugins
      ? await options.plugins
      : [];
    list.forEach((p) => registry.register(p));
    return registry.all();
  };

  const ensureExtensions = async (): Promise<Extension[]> => {
    const { extensions } = options
    if (!extensions) return []
    if (Array.isArray(extensions)) {
      const exts = await Promise.all(extensions)
      return exts
    }
    return await extensions
  }

  return {
    async render(containerElement: HTMLElement | null) {
      if (!containerElement) return;
      const plugins = await ensurePlugins();
      const exts = await ensureExtensions();
      // activate extensions
      const ctx = { 
        container: {
          get: (token: string) => container.get(token)
        }, 
        registry,
        events: container.get(TOKENS.events),
        commands: container.get(TOKENS.commands),
        slots: container.get(TOKENS.slots),
        config: container.get(TOKENS.config),
        theme: container.get(TOKENS.theme),
        logger: container.get(TOKENS.logger)
      } as any
      for (const e of exts) await e.activate(ctx)
      root = ReactDOM.createRoot(containerElement);
      root.render(React.createElement(MultiPaneShell, { plugins }));
    },
    dispose() {
      // TODO: call deactivate when kept
      root?.unmount();
      root = null;
    },
    registry,
    container,
  };
}



import React from 'react';

export interface LuckmdPluginMeta {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>; 
}

export interface LuckmdPlugin extends LuckmdPluginMeta {
  Sidebar?: React.ComponentType<any>;
  Content?: React.ComponentType<any>;
}

export interface LuckmdRegistry {
  register(plugin: LuckmdPlugin): void;
  all(): LuckmdPlugin[];
}



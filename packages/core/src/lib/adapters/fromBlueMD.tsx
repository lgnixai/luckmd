import React from 'react';
import { LuckmdPlugin } from '../types';

export function adaptBlueMDPlugin(id: string, title: string, Sidebar: React.ComponentType<any>, Content: React.ComponentType<any>, icon?: React.ComponentType<{ className?: string }>): LuckmdPlugin {
  return { id, title, Sidebar, Content, icon };
}



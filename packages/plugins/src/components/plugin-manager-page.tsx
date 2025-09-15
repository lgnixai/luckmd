import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PluginManagerSidebar } from './plugin-manager-sidebar';
import { PluginManagerContent } from './plugin-manager-content';
import { Plugin } from '../types/plugin';
import { ArrowLeft, Settings } from 'lucide-react';

interface PluginManagerPageProps {
  onClose?: () => void;
  className?: string;
}

/**
 * 插件管理页面组件
 * 整合侧边栏和内容区，提供完整的插件管理界面
 */
export const PluginManagerPage: React.FC<PluginManagerPageProps> = ({
  onClose,
  className = ''
}) => {
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  /**
   * 处理插件选择
   */
  const handlePluginSelect = (plugin: Plugin | null) => {
    setSelectedPlugin(plugin);
  };

  return (
    <div className={`flex h-full bg-background ${className}`}>
      {/* 侧边栏 */}
      <div className="w-80 flex-shrink-0">
        <PluginManagerSidebar
          selectedPlugin={selectedPlugin}
          onPluginSelect={handlePluginSelect}
        />
      </div>

      {/* 内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center gap-3">
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <h1 className="text-lg font-semibold">插件管理</h1>
            </div>
          </div>
          
          {selectedPlugin && (
            <div className="text-sm text-muted-foreground">
              已选择: <span className="font-medium">{selectedPlugin.name}</span>
            </div>
          )}
        </div>

        {/* 主内容区 */}
        <div className="flex-1">
          <PluginManagerContent selectedPlugin={selectedPlugin} />
        </div>
      </div>
    </div>
  );
};

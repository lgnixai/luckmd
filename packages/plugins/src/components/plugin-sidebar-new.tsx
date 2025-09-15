import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plugin } from '@/types/plugin';

interface PluginSidebarProps {
  activePlugin: Plugin | null;
  onClose: () => void;
}

export const PluginSidebarNew: React.FC<PluginSidebarProps> = ({
  activePlugin,
  onClose
}) => {
  if (!activePlugin) {
    return null;
  }

  // 获取插件的第一个路由组件
  const PluginComponent = activePlugin.routes?.[0]?.component;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-4xl bg-background border-l shadow-lg">
      <div className="flex flex-col h-full">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            {activePlugin.icon && <activePlugin.icon className="w-5 h-5" />}
            <h2 className="text-lg font-semibold">{activePlugin.name}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          {PluginComponent ? (
            <PluginComponent />
          ) : (
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">插件信息</h3>
                <p className="text-gray-600 mb-4">{activePlugin.description}</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>版本: {activePlugin.version}</p>
                  <p>作者: {activePlugin.author}</p>
                  <p>分类: {activePlugin.category}</p>
                  <p>状态: {activePlugin.config?.enabled ? '已启用' : '未启用'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


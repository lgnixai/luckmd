import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plugin } from '@/types/plugin';

interface PluginSidebarProps {
  activePlugin: Plugin | null;
  onClose: () => void;
}

export const PluginSidebarSimple: React.FC<PluginSidebarProps> = ({
  activePlugin,
  onClose
}) => {
  if (!activePlugin) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-background border-l shadow-lg">
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
        <div className="flex-1 overflow-y-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">插件信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">描述</p>
                <p className="text-sm">{activePlugin.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">版本</p>
                <p className="text-sm">{activePlugin.version}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">作者</p>
                <p className="text-sm">{activePlugin.author}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">分类</p>
                <p className="text-sm">{activePlugin.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">状态</p>
                <p className="text-sm">
                  {activePlugin.config?.enabled ? '已启用' : '未启用'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 路由信息 */}
          {activePlugin.routes && activePlugin.routes.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">可用路由</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activePlugin.routes.map((route, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{route.path}</span>
                      <span className="text-gray-500 ml-2">- {route.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 菜单信息 */}
          {activePlugin.menu && activePlugin.menu.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">菜单项</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activePlugin.menu.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      {item.icon && <item.icon className="w-4 h-4" />}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};


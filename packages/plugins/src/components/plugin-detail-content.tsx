import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePluginManager } from '../contexts/plugin-context';
import { Plugin } from '../types/plugin';
import { Trash2, Settings, Download, Eye, EyeOff } from 'lucide-react';

interface PluginDetailContentProps {
  plugin: Plugin | null;
}

export const PluginDetailContent: React.FC<PluginDetailContentProps> = ({ plugin }) => {
  const pluginManager = usePluginManager();

  if (!plugin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">选择插件</h2>
          <p className="text-gray-500">点击左侧的插件来查看详细信息</p>
        </div>
      </div>
    );
  }

  const isEnabled = plugin.config?.enabled;

  return (
    <div className="p-6">
      {/* 插件头部信息 */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          {React.createElement(plugin.icon, { className: 'w-8 h-8 text-primary' })}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{plugin.name}</h1>
            <Badge 
              variant={isEnabled ? 'default' : 'secondary'}
              className="text-sm"
            >
              {isEnabled ? '已启用' : '未启用'}
            </Badge>
          </div>
          <p className="text-gray-600 text-lg mb-4">{plugin.description}</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>版本</span>
              <span className="font-medium">{plugin.version}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>作者</span>
              <span className="font-medium">{plugin.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>分类</span>
              <span className="font-medium">{plugin.category || '未分类'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 插件操作区域 */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">插件操作</h3>
        <div className="flex gap-4">
          <Button
            variant={isEnabled ? "outline" : "default"}
            size="lg"
            onClick={() => {
              if (isEnabled) {
                pluginManager.disablePlugin(plugin.id);
              } else {
                pluginManager.enablePlugin(plugin.id);
              }
            }}
            className="flex items-center gap-2"
          >
            {isEnabled ? (
              <>
                <EyeOff className="w-4 h-4" />
                禁用插件
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                启用插件
              </>
            )}
          </Button>
          
          {isEnabled && (
            <Button
              variant="destructive"
              size="lg"
              onClick={() => pluginManager.uninstallPlugin(plugin.id)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              卸载插件
            </Button>
          )}
        </div>
      </div>

      {/* 插件详细信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            插件配置
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">插件ID</span>
              <span className="font-mono text-sm">{plugin.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">状态</span>
              <Badge variant={isEnabled ? 'default' : 'secondary'}>
                {isEnabled ? '已启用' : '未启用'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">位置</span>
              <span>{plugin.config?.position || '默认'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">显示在导航</span>
              <span>{plugin.config?.showInNav ? '是' : '否'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            插件信息
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">版本</span>
              <span className="font-medium">{plugin.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">作者</span>
              <span className="font-medium">{plugin.author}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">分类</span>
              <span className="font-medium">{plugin.category || '未分类'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">菜单项</span>
              <span>{plugin.menu?.length || 0} 个</span>
            </div>
          </div>
        </div>
      </div>

      {/* 插件描述 */}
      {plugin.description && (
        <div className="mt-6 bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">详细描述</h3>
          <p className="text-gray-600 leading-relaxed">{plugin.description}</p>
        </div>
      )}
    </div>
  );
};

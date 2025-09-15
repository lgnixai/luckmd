import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { usePluginManager, usePlugins } from '../contexts/plugin-context';
import { Plugin } from '../types/plugin';
import { useNavStore } from '../stores/nav-store';

interface PluginManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 插件管理弹窗组件
 */
export const PluginManagerModal: React.FC<PluginManagerModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const pluginManager = usePluginManager();
  const plugins = usePlugins();
  const { updateNavMain } = useNavStore();
  const [installing, setInstalling] = useState<string | null>(null);

  /**
   * 安装插件
   */
  const handleInstall = async (plugin: Plugin) => {
    setInstalling(plugin.id);
    try {
      pluginManager.installPlugin(plugin.id);
      pluginManager.enablePlugin(plugin.id);
      // 获取最新的插件数据并更新导航数据
      const updatedPlugins = pluginManager.getPlugins();
      updateNavMain(updatedPlugins);
    } catch (error) {
      console.error('Failed to install plugin:', error);
    } finally {
      setInstalling(null);
    }
  };

  /**
   * 卸载插件
   */
  const handleUninstall = (plugin: Plugin) => {
    pluginManager.uninstallPlugin(plugin.id);
    // 获取最新的插件数据并更新导航数据
    const updatedPlugins = pluginManager.getPlugins();
    updateNavMain(updatedPlugins);
  };

  /**
   * 启用/禁用插件
   */
  const handleToggleEnabled = (plugin: Plugin) => {
    if (plugin.config?.enabled) {
      pluginManager.disablePlugin(plugin.id);
    } else {
      pluginManager.enablePlugin(plugin.id);
    }
    // 获取最新的插件数据并更新导航数据
    const updatedPlugins = pluginManager.getPlugins();
    updateNavMain(updatedPlugins);
  };

  /**
   * 获取插件状态
   */
  const getPluginStatus = (plugin: Plugin) => {
    if (!plugin.config?.enabled) return 'available';
    if (plugin.config?.enabled) return 'enabled';
    return 'disabled';
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-500';
      case 'disabled': return 'bg-yellow-500';
      case 'available': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  /**
   * 获取状态文本
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'enabled': return '已启用';
      case 'disabled': return '已禁用';
      case 'available': return '可安装';
      default: return '未知';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            插件管理
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 已安装插件 */}
          <div>
            <h3 className="text-lg font-medium mb-4">已安装插件</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plugins
                .filter(plugin => plugin.config?.enabled)
                .map(plugin => {
                  const status = getPluginStatus(plugin);
                  return (
                    <div
                      key={plugin.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 flex items-center justify-center">
                            {React.createElement(plugin.icon)}
                          </div>
                          <div>
                            <h4 className="font-medium">{plugin.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {plugin.description}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          className={`${getStatusColor(status)} text-white`}
                        >
                          {getStatusText(status)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={plugin.config?.enabled || false}
                            onCheckedChange={() => handleToggleEnabled(plugin)}
                          />
                          <span className="text-sm">
                            {plugin.config?.enabled ? '启用' : '禁用'}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUninstall(plugin)}
                        >
                          卸载
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 可用插件 */}
          <div>
            <h3 className="text-lg font-medium mb-4">可用插件</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plugins
                .filter(plugin => !plugin.config?.enabled)
                .map(plugin => (
                  <div
                    key={plugin.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {React.createElement(plugin.icon)}
                        </div>
                        <div>
                          <h4 className="font-medium">{plugin.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {plugin.description}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-gray-500 text-white">
                        可安装
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        版本: {plugin.version}
                        {plugin.author && ` • 作者: ${plugin.author}`}
                      </div>
                      <Button
                        onClick={() => handleInstall(plugin)}
                        disabled={installing === plugin.id}
                        size="sm"
                      >
                        {installing === plugin.id ? '安装中...' : '安装'}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 插件统计 */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {plugins.length}
                </div>
                <div className="text-sm text-muted-foreground">总插件数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {plugins.filter(p => p.config?.enabled).length}
                </div>
                <div className="text-sm text-muted-foreground">已安装</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {plugins.filter(p => p.config?.enabled).length}
                </div>
                <div className="text-sm text-muted-foreground">已启用</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

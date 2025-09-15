import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usePluginManager } from '../contexts/plugin-context';
import { Plugin } from '../types/plugin';
import { useNavStore } from '../stores/nav-store';
import { 
  Download, 
  Trash2, 
  Settings, 
  Star, 
  User, 
  Calendar,
  Code,
  Info,
  Play,
  Pause,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface PluginManagerContentProps {
  selectedPlugin: Plugin | null;
  className?: string;
}

/**
 * 插件管理内容区组件
 * 显示选中插件的详细信息、配置和操作按钮
 */
export const PluginManagerContent: React.FC<PluginManagerContentProps> = ({
  selectedPlugin,
  className = ''
}) => {
  const pluginManager = usePluginManager();
  const { updateNavMain } = useNavStore();
  const [installing, setInstalling] = useState<string | null>(null);
  const [uninstalling, setUninstalling] = useState<string | null>(null);

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
  const handleUninstall = async (plugin: Plugin) => {
    setUninstalling(plugin.id);
    try {
      pluginManager.uninstallPlugin(plugin.id);
      // 获取最新的插件数据并更新导航数据
      const updatedPlugins = pluginManager.getPlugins();
      updateNavMain(updatedPlugins);
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
    } finally {
      setUninstalling(null);
    }
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
   * 获取状态信息
   */
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'enabled':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: CheckCircle,
          text: '已启用',
          description: '插件正在运行中'
        };
      case 'disabled':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          icon: AlertCircle,
          text: '已禁用',
          description: '插件已安装但未启用'
        };
      case 'available':
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: XCircle,
          text: '可安装',
          description: '插件可以安装使用'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: XCircle,
          text: '未知',
          description: '状态未知'
        };
    }
  };

  if (!selectedPlugin) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">选择插件</h3>
          <p className="text-muted-foreground">
            从左侧列表中选择一个插件来查看详细信息
          </p>
        </div>
      </div>
    );
  }

  const status = getPluginStatus(selectedPlugin);
  const statusInfo = getStatusInfo(status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 头部信息 */}
      <div className="p-6 border-b">
        <div className="flex items-start gap-4">
          {/* 插件图标 */}
          <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg flex-shrink-0">
            {React.createElement(selectedPlugin.icon, { className: 'w-8 h-8' })}
          </div>

          {/* 插件基本信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{selectedPlugin.name}</h1>
              <Badge 
                className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.text}
              </Badge>
            </div>
            
            <p className="text-muted-foreground mb-4">
              {selectedPlugin.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Code className="w-4 h-4" />
                <span>v{selectedPlugin.version}</span>
              </div>
              {selectedPlugin.author && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{selectedPlugin.author}</span>
                </div>
              )}
              {selectedPlugin.category && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{selectedPlugin.category}</span>
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col gap-2">
            {status === 'available' ? (
              <Button
                onClick={() => handleInstall(selectedPlugin)}
                disabled={installing === selectedPlugin.id}
                className="w-32"
              >
                <Download className="w-4 h-4 mr-2" />
                {installing === selectedPlugin.id ? '安装中...' : '安装'}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleUninstall(selectedPlugin)}
                  disabled={uninstalling === selectedPlugin.id}
                  className="w-32"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {uninstalling === selectedPlugin.id ? '卸载中...' : '卸载'}
                </Button>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selectedPlugin.config?.enabled || false}
                    onCheckedChange={() => handleToggleEnabled(selectedPlugin)}
                  />
                  <span className="text-sm">
                    {selectedPlugin.config?.enabled ? '启用' : '禁用'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl space-y-6">
          {/* 状态信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                插件状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg ${statusInfo.bgColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                  <span className={`font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {statusInfo.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 插件详情 */}
          <Card>
            <CardHeader>
              <CardTitle>插件详情</CardTitle>
              <CardDescription>
                关于此插件的详细信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">版本</label>
                  <p className="text-sm">{selectedPlugin.version}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">作者</label>
                  <p className="text-sm">{selectedPlugin.author || '未知'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">分类</label>
                  <p className="text-sm">{selectedPlugin.category || '未分类'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="text-sm font-mono">{selectedPlugin.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 插件功能 */}
          {selectedPlugin.routes && selectedPlugin.routes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>插件功能</CardTitle>
                <CardDescription>
                  此插件提供的功能模块
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedPlugin.routes.map((route, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded border">
                      <Play className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{route.name || `功能 ${index + 1}`}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 配置信息 */}
          {selectedPlugin.config && (
            <Card>
              <CardHeader>
                <CardTitle>配置信息</CardTitle>
                <CardDescription>
                  插件的当前配置状态
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">启用状态</span>
                    <Badge variant={selectedPlugin.config.enabled ? 'default' : 'secondary'}>
                      {selectedPlugin.config.enabled ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                  {selectedPlugin.config.position !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">显示位置</span>
                      <span className="text-sm">{selectedPlugin.config.position}</span>
                    </div>
                  )}
                  {selectedPlugin.config.showInNav !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">显示在导航</span>
                      <Badge variant={selectedPlugin.config.showInNav ? 'default' : 'secondary'}>
                        {selectedPlugin.config.showInNav ? '是' : '否'}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

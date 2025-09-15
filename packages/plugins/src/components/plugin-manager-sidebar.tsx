import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { usePluginManager, usePlugins } from '../contexts/plugin-context';
import { Plugin } from '../types/plugin';
import { 
  Search, 
  Package, 
  Settings, 
  Download, 
  Trash2,
  Eye,
  EyeOff,
  Star,
  Filter
} from 'lucide-react';

interface PluginManagerSidebarProps {
  selectedPlugin: Plugin | null;
  onPluginSelect: (plugin: Plugin | null) => void;
  className?: string;
}

/**
 * 插件管理侧边栏组件
 * 类似VSCode的侧边栏，显示插件列表和搜索功能
 */
export const PluginManagerSidebar: React.FC<PluginManagerSidebarProps> = ({
  selectedPlugin,
  onPluginSelect,
  className = ''
}) => {
  const pluginManager = usePluginManager();
  const plugins = usePlugins();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'installed' | 'available'>('all');

  /**
   * 过滤插件
   */
  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = (() => {
      switch (filterType) {
        case 'installed':
          return plugin.config?.enabled;
        case 'available':
          return !plugin.config?.enabled;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  /**
   * 获取插件状态
   */
  const getPluginStatus = (plugin: Plugin) => {
    if (!plugin.config?.enabled) return 'available';
    return 'installed';
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'installed': return 'bg-green-500';
      case 'available': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  /**
   * 获取状态文本
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'installed': return '已安装';
      case 'available': return '可安装';
      default: return '未知';
    }
  };

  /**
   * 处理插件点击
   */
  const handlePluginClick = (plugin: Plugin) => {
    onPluginSelect(plugin);
  };

  /**
   * 统计信息
   */
  const stats = {
    total: plugins.length,
    installed: plugins.filter(p => p.config?.enabled).length,
    available: plugins.filter(p => !p.config?.enabled).length
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 头部操作区 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">插件管理</h3>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="搜索插件..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 过滤器按钮 */}
      <div className="flex gap-1">
       
        <Button
          variant={filterType === 'installed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('installed')}
          className="flex-1 text-xs px-1 py-1 h-7"
        >
          <Download className="w-3 h-3 mr-1" />
          已装({stats.installed})
        </Button>
        <Button
          variant={filterType === 'available' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('available')}
          className="flex-1 text-xs px-1 py-1 h-7"
        >
          <Package className="w-3 h-3 mr-1" />
          可装({stats.available})
        </Button>
      </div>

      {/* 插件列表 */}
      <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {filteredPlugins.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📦</div>
            <p className="text-sm text-gray-500">暂无插件</p>
            <p className="text-xs text-gray-400 mt-1">请检查插件配置</p>
          </div>
        ) : (
          <div>
            {filteredPlugins.map(plugin => {
              const status = getPluginStatus(plugin);
              const isSelected = selectedPlugin?.id === plugin.id;
              
              return (
                <div
                  key={plugin.id}
                  onClick={() => handlePluginClick(plugin)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{plugin.name}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {plugin.description}
                      </p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {getStatusText(status)}
                      </Badge>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <div className="w-6 h-6 flex items-center justify-center">
                        {status === 'installed' ? (
                          <Eye className="h-3 w-3 text-green-500" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


      {/* 底部统计 */}
      <div className="p-4 border-t bg-muted/50">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-muted-foreground">总数</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{stats.installed}</div>
            <div className="text-xs text-muted-foreground">已安装</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">{stats.available}</div>
            <div className="text-xs text-muted-foreground">可安装</div>
          </div>
        </div>
      </div>
    </div>
  );
};

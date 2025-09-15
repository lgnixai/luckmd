import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Trash2, Upload, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useRSSStore, RSSFeed } from '../../stores/rss-store';

interface RSSSidebarProps { mode?: 'list-only' }

export const RSSSidebar: React.FC<RSSSidebarProps> = ({ mode }) => {
  const { 
    feeds, 
    selectedFeed, 
    loading, 
    setFeeds, 
    setSelectedFeed, 
    setLoading, 
    setError,
    addFeed,
    removeFeed
  } = useRSSStore();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [query, setQuery] = useState('');
  const [importing, setImporting] = useState(false);

  // 获取RSS源列表
  const fetchFeeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:6066/v1/rss/feeds');
      if (response.ok) {
        const data = await response.json();
        setFeeds(data.data?.items || []);
      } else {
        setError('获取RSS源失败');
      }
    } catch (error) {
      setError('获取RSS源失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加RSS源
  const handleAddFeed = async () => {
    if (!newFeedUrl.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:6066/v1/rss/feeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFeedUrl,
          url: newFeedUrl,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        addFeed(data.data);
        setNewFeedUrl('');
        setShowAddDialog(false);
      } else {
        setError('添加RSS源失败');
      }
    } catch (error) {
      setError('添加RSS源失败');
    } finally {
      setLoading(false);
    }
  };

  // 批量导入常用源（通过多次POST）
  const handleImportHotFeeds = async () => {
    const candidates: Array<{ name: string; url: string; site_url?: string; description?: string }> = [
      { name: '阮一峰的网络日志', url: 'https://www.ruanyifeng.com/blog/atom.xml', site_url: 'https://www.ruanyifeng.com/blog/', description: '技术与互联网笔记' },
      { name: '少数派', url: 'https://sspai.com/feed', site_url: 'https://sspai.com', description: '高效工作与品质生活' },
      { name: '爱范儿 ifanr', url: 'https://www.ifanr.com/feed', site_url: 'https://www.ifanr.com', description: '创新与产品早报道' },
      { name: 'V2EX 最热', url: 'https://www.v2ex.com/index.xml', site_url: 'https://www.v2ex.com', description: '创意工作者社区' },
      { name: '酷壳 – CoolShell', url: 'https://coolshell.cn/feed', site_url: 'https://coolshell.cn', description: '陈皓的技术博客' },
    ];

    try {
      setImporting(true);
      for (const f of candidates) {
        await fetch('http://localhost:6066/v1/rss/feeds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: f.name,
            url: f.url,
            site_url: f.site_url,
            description: f.description,
            enabled: true,
          }),
        });
      }
      // 导入后刷新列表
      fetchFeeds();
    } finally {
      setImporting(false);
    }
  };

  // 删除RSS源
  const handleDeleteFeed = async (feedId: number) => {
    if (!confirm('确定要删除这个RSS源吗？')) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:6066/v1/rss/feeds/${feedId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        removeFeed(feedId);
      } else {
        setError('删除RSS源失败');
      }
    } catch (error) {
      setError('删除RSS源失败');
    } finally {
      setLoading(false);
    }
  };

  // 刷新RSS源
  const handleRefreshFeed = async (feedId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:6066/v1/rss/feeds/${feedId}/fetch`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // 刷新成功后重新获取源列表
        fetchFeeds();
      } else {
        setError('刷新RSS源失败');
      }
    } catch (error) {
      setError('刷新RSS源失败');
    } finally {
      setLoading(false);
    }
  };

  // 选择RSS源
  const handleSelectFeed = (feed: RSSFeed) => {
    setSelectedFeed(feed);
  };

  // 初始化加载RSS源
  useEffect(() => {
    fetchFeeds();
  }, []);

  return (
    <div className="space-y-4">
      {/* 头部操作区（list-only 模式：显示搜索/添加/导入/刷新按钮，保持紧凑） */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">RSS源管理</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={fetchFeeds}
              disabled={loading}
              title="刷新源列表"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleImportHotFeeds}
              disabled={importing}
              title="导入常用源"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button 
              size="sm"
              onClick={() => setShowAddDialog(true)}
              title="添加源"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Input
            placeholder="搜索源..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
          <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* RSS源列表 */}
      <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {feeds.filter(f => {
          if (!query.trim()) return true;
          const q = query.trim().toLowerCase();
          return (
            f.name?.toLowerCase().includes(q) ||
            f.url?.toLowerCase().includes(q) ||
            (f.description || '').toLowerCase().includes(q)
          );
        }).map((feed) => (
          <div
            key={feed.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedFeed?.id === feed.id 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => handleSelectFeed(feed)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{feed.name}</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {feed.description || feed.url}
                </p>
                {feed.item_count && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {feed.item_count} 篇文章
                  </Badge>
                )}
              </div>
              {true && (
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRefreshFeed(feed.id);
                    }}
                    disabled={loading}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFeed(feed.id);
                    }}
                    disabled={loading}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {feeds.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📰</div>
            <p className="text-sm text-gray-500">暂无RSS源</p>
            <p className="text-xs text-gray-400 mt-1">点击"+"按钮添加RSS源</p>
          </div>
        )}
      </div>

      {/* 添加RSS源对话框（list-only 模式下隐藏） */}
      {mode !== 'list-only' && showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">添加RSS源</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RSS源URL
                </label>
                <Input
                  type="text"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  placeholder="请输入RSS源URL"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={handleAddFeed}
                  disabled={loading}
                >
                  添加
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

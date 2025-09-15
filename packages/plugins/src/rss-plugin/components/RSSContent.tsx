import React, { useEffect } from 'react';
import { ExternalLink, Calendar, User, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useRSSStore, RSSItem } from '../../stores/rss-store';

export const RSSContent: React.FC = () => {
  const { 
    selectedFeed, 
    items, 
    selectedItem, 
    loading, 
    setItems, 
    setSelectedItem, 
    setLoading, 
    setError 
  } = useRSSStore();

  // 获取RSS文章列表
  const fetchItems = async (feedId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:6066/v1/rss/feeds/${feedId}/items`);
      if (response.ok) {
        const data = await response.json();
        // 服务端当前返回的是直接数组 data: [] 或 data 即为数组，做兼容
        const payload = data?.data;
        const list = Array.isArray(payload) ? payload : (payload?.items || []);
        setItems(list);
      } else {
        setError('获取RSS文章失败');
      }
    } catch (error) {
      setError('获取RSS文章失败');
    } finally {
      setLoading(false);
    }
  };

  // 刷新RSS源
  const handleRefreshFeed = async () => {
    if (!selectedFeed) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:6066/v1/rss/feeds/${selectedFeed.id}/fetch`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // 刷新成功后重新获取文章列表
        fetchItems(selectedFeed.id);
      } else {
        setError('刷新RSS源失败');
      }
    } catch (error) {
      setError('刷新RSS源失败');
    } finally {
      setLoading(false);
    }
  };

  // 选择文章
  const handleSelectItem = (item: RSSItem) => {
    setSelectedItem(item);
  };

  // 打开文章链接
  const handleOpenArticle = (item: RSSItem) => {
    if (item.link) {
      window.open(item.link, '_blank');
    }
  };

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // 截取描述文本
  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // 当选中RSS源时，获取文章列表
  useEffect(() => {
    if (selectedFeed) {
      fetchItems(selectedFeed.id);
    } else {
      setItems([]);
      setSelectedItem(null);
    }
  }, [selectedFeed]);

  if (!selectedFeed) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">选择RSS源</h3>
          <p className="text-gray-600">请从左侧选择一个RSS源来查看文章</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* 左侧：文章列表 */}
      <div className="w-[40%] min-w-[380px] border-r overflow-hidden">
        <Card className="h-full flex flex-col rounded-none border-0">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedFeed.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedFeed.description || selectedFeed.url}
                </p>
              </div>
              <Button 
                onClick={handleRefreshFeed}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文章</h3>
                <p className="text-gray-600 mb-4">这个RSS源还没有文章，或者需要刷新</p>
                <Button 
                  onClick={handleRefreshFeed}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新RSS源
                </Button>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedItem?.id === item.id 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectItem(item)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-2 mb-2">{item.title}</h3>
                          {item.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {truncateText(item.description, 100)}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {item.published_at && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(item.published_at)}
                              </div>
                            )}
                            {item.author && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {item.author}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenArticle(item);
                          }}
                          className="ml-2 flex-shrink-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 右侧：文章详情 */}
      {selectedItem && (
        <div className="flex-1 min-w-0">
          <Card className="h-full rounded-none border-0">
            <CardHeader>
              <CardTitle className="text-lg">文章详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">标题：</span>
                  <span className="text-gray-900 ml-2">{selectedItem.title}</span>
                </div>
                {selectedItem.author && (
                  <div>
                    <span className="font-medium text-gray-700">作者：</span>
                    <span className="text-gray-900 ml-2">{selectedItem.author}</span>
                  </div>
                )}
                {selectedItem.published_at && (
                  <div>
                    <span className="font-medium text-gray-700">发布时间：</span>
                    <span className="text-gray-900 ml-2">{formatDate(selectedItem.published_at)}</span>
                  </div>
                )}
                {selectedItem.description && (
                  <div>
                    <span className="font-medium text-gray-700">摘要：</span>
                    <p className="text-gray-900 mt-1 text-sm leading-relaxed">
                      {selectedItem.description}
                    </p>
                  </div>
                )}
                <div className="pt-3">
                  <Button 
                    onClick={() => handleOpenArticle(selectedItem)}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    阅读原文
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

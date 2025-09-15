import React, { useEffect } from 'react';
import { RSSContent } from './RSSContent';
import { useRSSStore } from '@/stores/rss-store';

export const RSSComponent: React.FC = () => {
  const { feeds, selectedFeed, setFeeds, setSelectedFeed, loading, setLoading, setError } = useRSSStore();

  // 加载订阅源列表（用于默认选中）
  const fetchFeeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:6066/v1/rss/feeds');
      if (response.ok) {
        const data = await response.json();
        setFeeds(data.data?.items || []);
        // 若未选中任何源，则默认选第一个
        if (!selectedFeed && (data.data?.items?.length || 0) > 0) {
          setSelectedFeed(data.data.items[0]);
        }
      } else {
        setError('获取RSS源失败');
      }
    } catch (error) {
      setError('获取RSS源失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      {/* 内容区：列表 + 详情（内部组件负责）*/}
      <div className="flex-1 min-h-0">
        <RSSContent />
      </div>
    </div>
  );
};
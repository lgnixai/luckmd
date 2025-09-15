import React, { useRef, useCallback, useMemo } from 'react';
import { Play, Star, Calendar, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Movie } from '../../api-service';
import { useMovieSearchStore } from '../../stores/movie-search-store';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '../../api-service';

interface MovieSearchResultsProps {
  onMovieClick: (movie: Movie) => void;
}

// 定义API响应类型
type MovieApiResponse = {
  movies: Movie[];
  page: number;
  total_page: number;
  total: number;
};

const fetchSize = 20;

export const MovieSearchResults: React.FC<MovieSearchResultsProps> = ({
  onMovieClick
}) => {
  const { filters } = useMovieSearchStore();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  const handleMovieClick = (movie: Movie) => {
    // 直接在新标签页打开，不显示弹窗
    window.open(`/src/pages/video-player.html?movieId=${movie.id}`, '_blank');
    onMovieClick(movie);
  };

  // 使用useInfiniteQuery进行无限滚动数据获取
  const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery<MovieApiResponse>({
    queryKey: ['movies', filters], // 当filters变化时重新获取数据
    queryFn: async ({ pageParam = 1 }) => {
      const params: any = {
        page: pageParam,
        page_size: fetchSize
      };

      // 添加搜索参数
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.category && filters.category !== '全部') {
        const categoryId = parseInt(filters.category);
        
        if (filters.categoryType === 'pid') {
          params.pid = categoryId;
        } else if (filters.categoryType === 'cid') {
          params.cid = categoryId;
        }
      }
      if (filters.year && filters.year !== '全部') params.year = parseInt(filters.year);
      if (filters.area && filters.area !== '全部') params.area = filters.area;
      
      // 添加排序参数
      const sortMapping: Record<string, { sort_by: string; sort_order: string }> = {
        '按更新': { sort_by: 'created_at', sort_order: 'desc' },
        '周人气': { sort_by: 'week_views', sort_order: 'desc' },
        '月人气': { sort_by: 'month_views', sort_order: 'desc' }
      };
      
      if (filters.sort && sortMapping[filters.sort]) {
        const sortConfig = sortMapping[filters.sort];
        params.sort_by = sortConfig.sort_by;
        params.sort_order = sortConfig.sort_order;
      }

      const response = await apiService.searchMovies(params);
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.total_page ? lastPage.page + 1 : undefined;
    },
    refetchOnWindowFocus: false,
  });

  // 扁平化数据
  const flatData = useMemo(
    () => data?.pages?.flatMap(page => page.movies) ?? [],
    [data]
  );
  
  const totalDBRowCount = data?.pages?.[0]?.total ?? 0;
  const totalFetched = flatData.length;

  // 滚动到底部时获取更多数据的回调函数
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        
        // 当用户滚动到距离底部500px以内时，获取更多数据
        if (
          distanceFromBottom < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  );

  // 在组件挂载和获取数据后检查是否需要立即获取更多数据
  React.useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  // 移除虚拟化滚动，使用简单的网格布局

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">搜索中...</p>
        </div>
      </div>
    );
  }

  if (flatData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🎬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到相关电影</h3>
          <p className="text-gray-600">请尝试其他搜索条件</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      {/* 搜索结果统计 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          搜索结果
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({flatData.length} of {totalDBRowCount} 部电影)
          </span>
        </h2>
      </div>

      {/* 电影网格布局 */}
      <div
        ref={tableContainerRef}
        onScroll={e => fetchMoreOnBottomReached(e.currentTarget as HTMLDivElement)}
        style={{
          overflow: 'auto',
          position: 'relative',
          height: 'calc(100vh - 200px)', // 固定高度
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 p-2">
          {flatData.map((movie) => (
            <div
              key={movie.id}
              className="group cursor-pointer"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-3">
                {movie.picture && movie.picture.trim() ? (
                  <img
                    src={movie.picture}
                    alt={movie.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎬</div>
                      <div className="text-sm">暂无封面</div>
                    </div>
                  </div>
                )}
                
                {/* 播放按钮 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Button
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 p-0 pointer-events-auto transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMovieClick(movie);
                    }}
                    title="播放电影"
                  >
                    <Play className="w-5 h-5 ml-0.5" />
                  </Button>
                </div>
              </div>

              {/* 电影信息 */}
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                  {movie.name}
                </h3>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{movie.descriptor?.year || '未知年份'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{movie.descriptor?.area || '未知地区'}</span>
                  </div>
                </div>

                {/* 分类标签 */}
                <div>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {movie.category?.name || '未知分类'}
                  </Badge>
                </div>

                {/* 评分 */}
                {movie.descriptor?.db_score && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">{movie.descriptor.db_score}</span>
                  </div>
                )}

                {/* 更新时间 */}
                <p className="text-xs text-gray-400">
                  {new Date(movie.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 加载状态指示器 */}
      {isFetching && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            <span className="text-gray-600">加载更多...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieSearchResults;
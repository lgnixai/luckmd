import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
// import { Badge } from '../../components/ui/badge';
import { useMovieSearchStore } from '../../stores/movie-search-store';
import { CategorySelector } from '../../components/CategorySelector';

// 移除硬编码的分类数据，改为使用API获取

const years = [
  '全部', '2025', '2024', '2023', '2022', '2021', '2020', 
  '2019', '2018', '2017', '2016', '2015', '更早'
];

const areas = [
  '全部', '中国大陆', '香港', '台湾', '美国', '日本', '韩国', 
  '英国', '法国', '德国', '泰国', '印度', '加拿大', '西班牙', '俄罗斯', '其他'
];

const sortOptions = [
  '按更新', '周人气', '月人气'
];

// 排序选项映射
// const sortMapping: Record<string, { sort_by: string; sort_order: string }> = {
//   '按更新': { sort_by: 'created_at', sort_order: 'desc' },
//   '周人气': { sort_by: 'score', sort_order: 'desc' },
//   '月人气': { sort_by: 'score', sort_order: 'desc' }
// };

export const MovieSearchSidebar: React.FC = () => {
  const { filters, setFilters } = useMovieSearchStore();

  const handleKeywordChange = (value: string) => {
    const newFilters = { ...filters, keyword: value };
    setFilters(newFilters);
  };

  const handleFilterChange = (type: keyof Omit<typeof filters, 'keyword'>, value: string) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
  };

  // 处理分类联动变化
  const handleCategoryChange = (typeId: number | null, categoryId: number | null) => {
    const newFilters = { ...filters };
    
    if (categoryId) {
      // 如果选择了二级分类，使用categoryId
      newFilters.category = categoryId.toString();
      newFilters.categoryType = 'cid'; // 标记为二级分类
    } else if (typeId) {
      // 如果选择了一级分类，使用typeId
      newFilters.category = typeId.toString();
      newFilters.categoryType = 'pid'; // 标记为一级分类
    } else {
      // 如果选择了"全部"，重置分类
      newFilters.category = '全部';
      newFilters.categoryType = null;
    }
    
    setFilters(newFilters);
  };

  const handleSearch = () => {
    // 搜索逻辑由MovieSearchResults组件处理
    // 这里只需要触发filters更新即可
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 移除搜索逻辑，由MovieSearchResults组件处理

  const renderFilterSection = (
    title: string,
    options: string[],
    currentValue: string,
    onChange: (value: string) => void
  ) => (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <button
            key={option}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              currentValue === option
                ? 'bg-red-100 text-red-600 border border-red-200'
                : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  // 移除不再需要的renderCategorySection函数

  return (
    <div>
      {/* 关键字搜索 */}
      <div className="mb-4">
        {/* <h3 className="text-sm font-medium text-gray-700 mb-2">搜索电影</h3> */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="搜索电影..."
              value={filters.keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-red-600 hover:bg-red-700 text-white px-4"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 移除当前筛选条件显示区块 */}

      {/* 分类联动筛选 */}
      <div className="mb-4">
        <CategorySelector
          onCategoryChange={handleCategoryChange}
          selectedTypeId={filters.category !== '全部' ? parseInt(filters.category) : null}
          className="w-full"
        />
      </div>

      {/* 年份筛选 */}
      {renderFilterSection(
        '年份',
        years,
        filters.year,
        (value) => handleFilterChange('year', value)
      )}

      {/* 地区筛选 */}
      {renderFilterSection(
        '地区',
        areas,
        filters.area,
        (value) => handleFilterChange('area', value)
      )}

      {/* 排序方式 */}
      {renderFilterSection(
        '排序',
        sortOptions,
        filters.sort,
        (value) => handleFilterChange('sort', value)
      )}

      {/* 清除筛选 */}
      <Button
        variant="outline"
        onClick={() => {
          const resetFilters = {
            keyword: '',
            category: '全部',
            year: '全部',
            area: '全部',
            sort: '按更新'
          };
          setFilters(resetFilters);
          // searchMovies(resetFilters, 1);
        }}
        className="w-full mt-2 text-xs"
        size="sm"
      >
        <Filter className="h-3 w-3 mr-1" />
        清除筛选
      </Button>
    </div>
  );
};

export default MovieSearchSidebar;
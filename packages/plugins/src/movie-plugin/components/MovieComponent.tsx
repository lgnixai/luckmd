import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
// import { Separator } from '@/components/ui/separator'
import { apiService, Movie, MovieStats, SpiderTask } from '../api-service'
import { MovieIcon } from '../assets/movie-icon'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface SearchFilters {
  keyword: string
  category: string
  year: string
  area: string
  sort: string
}

interface MovieState {
  loading: boolean
  error: string | null
  movies: Movie[]
  stats: MovieStats | null
  spiderTasks: SpiderTask[]
  currentPage: number
  totalPages: number
  searchTerm: string
  total: number
  searchFilters: SearchFilters
  showSearchInterface: boolean
}

export const MovieComponent: React.FC = () => {
  const [state, setState] = useState<MovieState>({
    loading: false,
    error: null,
    movies: [],
    stats: null,
    spiderTasks: [],
    currentPage: 1,
    totalPages: 1,
    searchTerm: '',
    total: 0,
    searchFilters: {
      keyword: '',
      category: '全部',
      year: '全部',
      area: '全部',
      sort: '按更新'
    },
    showSearchInterface: true
  })

  const loadMovies = async (page: number = 1, search?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const [moviesResponse, statsResponse, tasksResponse] = await Promise.all([
        apiService.getMovies({ page, page_size: 10, keyword: search }),
        apiService.getMovieStats(),
        apiService.getSpiderTasks()
      ])

      setState(prev => ({
        ...prev,
        loading: false,
        movies: moviesResponse.data.movies,
        currentPage: moviesResponse.data.page,
        totalPages: moviesResponse.data.total_page,
        total: moviesResponse.data.total,
        stats: statsResponse.data,
        spiderTasks: tasksResponse.data.data
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '加载失败'
      }))
    }
  }

  const searchMovies = async (filters: SearchFilters, page: number = 1) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const params: any = {
        page,
        page_size: 20
      }

      // 添加搜索参数
      if (filters.keyword) params.keyword = filters.keyword
      if (filters.category && filters.category !== '全部') params.category_id = parseInt(filters.category)
      if (filters.year && filters.year !== '全部') params.year = parseInt(filters.year)
      if (filters.area && filters.area !== '全部') params.area = filters.area

      const moviesResponse = await apiService.searchMovies(params)

      setState(prev => ({
        ...prev,
        loading: false,
        movies: moviesResponse.data.movies,
        currentPage: moviesResponse.data.page,
        totalPages: moviesResponse.data.total_page,
        total: moviesResponse.data.total,
        searchFilters: filters
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '搜索失败'
      }))
    }
  }


  const createSpiderTask = async (taskType: string) => {
    try {
      await apiService.createSpiderTask(taskType)
      // 重新加载数据
      loadMovies(state.currentPage, state.searchFilters.keyword)
    } catch (error) {
      console.error('创建采集任务失败:', error)
    }
  }


  const getTaskStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">已完成</Badge>
      case 'running':
        return <Badge variant="default" className="bg-blue-500">运行中</Badge>
      case 'failed':
        return <Badge variant="destructive">失败</Badge>
      case 'pending':
        return <Badge variant="secondary">等待中</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // 组件挂载时加载数据
  useEffect(() => {
    if (state.showSearchInterface) {
      // 如果显示搜索界面，加载初始搜索数据
      searchMovies(state.searchFilters, 1)
    } else {
      // 否则加载传统的数据
      loadMovies()
    }
  }, [])

  // 不再显示搜索界面，而是显示传统的插件信息

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MovieIcon className="w-6 h-6" />
          <h1 className="text-2xl font-bold">电影数据</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => createSpiderTask('recent')}
            variant="outline"
            size="sm"
          >
            增量更新
          </Button>
          <Button 
            onClick={() => createSpiderTask('full')}
            variant="outline"
            size="sm"
          >
            全量采集
          </Button>
        </div>
      </div>

      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">加载错误</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{state.error}</p>
          </CardContent>
        </Card>
      )}

      {/* 移除统计信息显示区块 */}

      {/* 搜索 */}
      <Card>
        {/* <CardHeader>
          <CardTitle>搜索电影</CardTitle>
        </CardHeader> */}
        <CardContent>
          <Input
            placeholder="输入电影名称搜索..."
            value={state.searchTerm}
            onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* 移除采集任务状态显示区块 */}

      {/* 移除电影列表显示区块 */}
    </div>
  )
}

// 创建QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      retry: 1,
    },
  },
});

// 包装组件以提供QueryClient
export const MovieComponentWithQuery: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MovieComponent />
    </QueryClientProvider>
  );
};

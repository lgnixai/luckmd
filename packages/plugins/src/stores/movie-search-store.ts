import { create } from 'zustand'
import { Movie } from '../api-service'

interface SearchFilters {
  keyword: string
  category: string
  year: string
  area: string
  sort: string
  categoryType?: string | null
}

interface MovieSearchState {
  // 搜索状态
  filters: SearchFilters
  movies: Movie[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  total: number
  currentPage: number
  totalPages: number
  hasMore: boolean
  
  // 操作方法
  setFilters: (filters: SearchFilters) => void
  setMovies: (movies: Movie[]) => void
  appendMovies: (movies: Movie[]) => void
  setLoading: (loading: boolean) => void
  setLoadingMore: (loadingMore: boolean) => void
  setError: (error: string | null) => void
  setTotal: (total: number) => void
  setCurrentPage: (page: number) => void
  setTotalPages: (pages: number) => void
  setHasMore: (hasMore: boolean) => void
  loadMore: () => Promise<void>
  reset: () => void
}

const initialFilters: SearchFilters = {
  keyword: '',
  category: '全部',
  year: '全部',
  area: '全部',
  sort: '按更新'
}

export const useMovieSearchStore = create<MovieSearchState>((set, get) => ({
  // 初始状态
  filters: initialFilters,
  movies: [],
  loading: false,
  loadingMore: false,
  error: null,
  total: 0,
  currentPage: 1,
  totalPages: 0,
  hasMore: true,
  
  // 操作方法
  setFilters: (filters) => set({ filters }),
  setMovies: (movies) => set({ movies }),
  appendMovies: (movies) => set((state) => ({ 
    movies: [...state.movies, ...movies] 
  })),
  setLoading: (loading) => set({ loading }),
  setLoadingMore: (loadingMore) => set({ loadingMore }),
  setError: (error) => set({ error }),
  setTotal: (total) => set({ total }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setHasMore: (hasMore) => set({ hasMore }),
  
  // 加载更多数据
  loadMore: async () => {
    const state = get()
    if (state.loadingMore || !state.hasMore) return
    
    set({ loadingMore: true, error: null })
    
    try {
      const { apiService } = await import('../api-service')
      const nextPage = state.currentPage + 1
      
      const params: any = {
        page: nextPage,
        page_size: 20
      }

      // 添加搜索参数
      if (state.filters.keyword) params.keyword = state.filters.keyword
      if (state.filters.category && state.filters.category !== '全部') params.category_id = parseInt(state.filters.category)
      if (state.filters.year && state.filters.year !== '全部') params.year = parseInt(state.filters.year)
      if (state.filters.area && state.filters.area !== '全部') params.area = state.filters.area

      const moviesResponse = await apiService.searchMovies(params)
      const newMovies = moviesResponse.data.movies
      
      set((state) => ({
        movies: [...state.movies, ...newMovies],
        currentPage: nextPage,
        hasMore: nextPage < moviesResponse.data.total_page,
        loadingMore: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载更多失败',
        loadingMore: false 
      })
    }
  },
  
  reset: () => set({
    filters: initialFilters,
    movies: [],
    loading: false,
    loadingMore: false,
    error: null,
    total: 0,
    currentPage: 1,
    totalPages: 0,
    hasMore: true
  })
}))

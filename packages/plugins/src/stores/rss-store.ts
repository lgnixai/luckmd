import { create } from 'zustand'

export interface RSSFeed {
  id: number
  name: string
  url: string
  description?: string
  site_url?: string
  enabled?: boolean
  last_fetch_at?: string
  item_count?: number
}

export interface RSSItem {
  id: number
  feed_id: number
  title: string
  link: string
  description?: string
  published_at?: string
  author?: string
  content?: string
}

interface RSSState {
  // 订阅源相关
  feeds: RSSFeed[]
  selectedFeed: RSSFeed | null
  loading: boolean
  error: string | null
  
  // 文章相关
  items: RSSItem[]
  selectedItem: RSSItem | null
  
  // 分页相关
  currentPage: number
  totalPages: number
  total: number
  
  // 订阅源管理
  setFeeds: (feeds: RSSFeed[]) => void
  setSelectedFeed: (feed: RSSFeed | null) => void
  addFeed: (feed: RSSFeed) => void
  removeFeed: (feedId: number) => void
  updateFeed: (feedId: number, updates: Partial<RSSFeed>) => void
  
  // 文章管理
  setItems: (items: RSSItem[]) => void
  setSelectedItem: (item: RSSItem | null) => void
  
  // 状态管理
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // 分页管理
  setCurrentPage: (page: number) => void
  setTotalPages: (totalPages: number) => void
  setTotal: (total: number) => void
  
  // 重置状态
  reset: () => void
}

export const useRSSStore = create<RSSState>()((set) => ({
  // 初始状态
  feeds: [],
  selectedFeed: null,
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  total: 0,

  // 订阅源管理
  setFeeds: (feeds) => set({ feeds }),
  setSelectedFeed: (feed) => set({ selectedFeed: feed, selectedItem: null, items: [] }),
  addFeed: (feed) => set((state) => ({ feeds: [...state.feeds, feed] })),
  removeFeed: (feedId) => set((state) => ({
    feeds: state.feeds.filter(f => f.id !== feedId),
    selectedFeed: state.selectedFeed?.id === feedId ? null : state.selectedFeed,
    items: state.selectedFeed?.id === feedId ? [] : state.items,
    selectedItem: state.selectedFeed?.id === feedId ? null : state.selectedItem
  })),
  updateFeed: (feedId, updates) => set((state) => ({
    feeds: state.feeds.map(f => f.id === feedId ? { ...f, ...updates } : f),
    selectedFeed: state.selectedFeed?.id === feedId ? { ...state.selectedFeed, ...updates } : state.selectedFeed
  })),

  // 文章管理
  setItems: (items) => set({ items }),
  setSelectedItem: (item) => set({ selectedItem: item }),

  // 状态管理
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // 分页管理
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setTotal: (total) => set({ total }),

  // 重置状态
  reset: () => set({
    feeds: [],
    selectedFeed: null,
    items: [],
    selectedItem: null,
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    total: 0
  })
}))

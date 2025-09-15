/**
 * API 服务
 * 简化版本，专注于 MVP 验证
 */

import { apiClient, ApiResponse } from './api-client'

// 健康检查响应
export interface HealthStatus {
  status: string
  version: string
}

// 项目信息响应
export interface ProjectInfo {
  name: string
  description: string
  version: string
  go_version: string
  build_time: string
  environment: string
  api: {
    version: string
    base_url: string
    endpoints: string[]
    features: string[]
  }
  links: {
    documentation: string
    health: string
    swagger: string
  }
}

// 剧集数据接口
export interface Episode {
  id: number
  movie_id: number
  episode: string
  play_url: string
  download_url?: string
  player_type?: string
  created_at: string
  updated_at: string
}

// 电影URL信息
export interface MovieUrlInfo {
  episode: string
  link: string
}

// 电影描述信息
export interface MovieDescriptor {
  sub_title?: string
  c_name?: string
  en_name?: string
  initial?: string
  class_tag?: string
  actor?: string
  director?: string
  writer?: string
  blurb?: string
  remarks?: string
  release_date?: string
  area?: string
  language?: string
  year?: string
  state?: string
  update_time?: string
  add_time?: number
  db_id?: number
  db_score?: string
  hits?: number
  content?: string
}

// 电影数据接口 - 匹配服务端API
export interface Movie {
  id: number
  vod_id: number
  cid: number
  pid: number
  name: string
  picture?: string
  play_from?: string[]
  down_from?: string
  play_list?: MovieUrlInfo[][]
  download_list?: MovieUrlInfo[][]
  descriptor?: MovieDescriptor
  category_id?: number
  category?: {
    id: number
    type_id: number
    pid: number
    name: string
    show: boolean
    parent_id?: number
    created_at: string
    updated_at: string
  }
  created_at: string
  updated_at: string
}

// 电影统计信息 - 匹配服务端API
export interface MovieStats {
  total_movies: number
  total_categories: number
  recent_movies: number
}

// 分类信息
export interface Category {
  id: number
  type_id: number
  pid: number
  name: string
  show: boolean
  parent_id?: number
  parent?: Category
  children: Category[]
  created_at: string
  updated_at: string
}

// 分类列表响应
export interface CategoryListResponse {
  categories: Category[]
  total: number
}

// 采集任务状态
export interface SpiderTask {
  id: number
  task_type: string
  status: string
  progress: number
  total_items: number
  processed_items: number
  error_message?: string
  created_at: string
  updated_at: string
}

/**
 * API 服务类
 */
export class ApiService {
  /**
   * 健康检查
   */
  async checkHealth(): Promise<ApiResponse<HealthStatus>> {
    return apiClient.get<HealthStatus>('/health/status')
  }

  /**
   * 获取项目信息
   */
  async getProjectInfo(): Promise<ApiResponse<ProjectInfo>> {
    return apiClient.get<ProjectInfo>('/')
  }

  /**
   * 获取电影列表
   */
  async getMovies(params?: {
    page?: number
    page_size?: number
    category_id?: number
    keyword?: string
    sort_by?: string
    sort_order?: string
  }): Promise<ApiResponse<{ movies: Movie[]; total: number; page: number; page_size: number; total_page: number }>> {
    return apiClient.get('/movies', params)
  }

  /**
   * 获取电影详情
   */
  async getMovie(id: number): Promise<ApiResponse<Movie>> {
    return apiClient.get(`/movies/${id}`)
  }

  /**
   * 根据VodID获取电影详情
   */
  async getMovieByVodId(vodId: number): Promise<ApiResponse<Movie>> {
    return apiClient.get(`/movies/vod/${vodId}`)
  }

  /**
   * 搜索电影
   */
  async searchMovies(params?: {
    keyword?: string
    page?: number
    page_size?: number
    category_id?: number
    pid?: number
    cid?: number
    year?: number
    area?: string
    language?: string
    plot?: string
    remarks?: string
    begin_time?: string
    end_time?: string
    sort_by?: string
    sort_order?: string
  }): Promise<ApiResponse<{ movies: Movie[]; total: number; page: number; page_size: number; total_page: number }>> {
    return apiClient.get('/movies/search', params)
  }

  /**
   * 获取电影统计信息
   */
  async getMovieStats(): Promise<ApiResponse<MovieStats>> {
    return apiClient.get('/movies/stats')
  }

  /**
   * 获取分类列表
   */
  async getCategories(): Promise<ApiResponse<CategoryListResponse>> {
    return apiClient.get('/categories')
  }

  /**
   * 根据TypeID获取分类详情
   */
  async getCategoryByTypeId(typeId: number): Promise<ApiResponse<Category>> {
    return apiClient.get(`/categories/type/${typeId}`)
  }

  /**
   * 获取采集任务列表
   */
  async getSpiderTasks(): Promise<ApiResponse<{ data: SpiderTask[]; total: number; page: number; page_size: number; total_pages: number }>> {
    return apiClient.get('/spider/tasks')
  }

  /**
   * 创建采集任务
   */
  async createSpiderTask(taskType: string): Promise<ApiResponse<SpiderTask>> {
    return apiClient.post('/spider/tasks', { task_type: taskType })
  }

  /**
   * 获取采集任务详情
   */
  async getSpiderTask(id: number): Promise<ApiResponse<SpiderTask>> {
    return apiClient.get(`/spider/tasks/${id}`)
  }

}

// 创建默认 API 服务实例
export const apiService = new ApiService()

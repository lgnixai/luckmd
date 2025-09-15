/**
 * API 客户端
 * 用于与 Go 后端服务器通信
 */

// API 配置
const API_CONFIG = {
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:6066',
  timeout: 10000,
  version: 'v1'
}

// 请求拦截器类型
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
type ResponseInterceptor = (response: Response) => Response | Promise<Response>

// 请求配置接口
interface RequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  params?: Record<string, any>
  timeout?: number
}

// API 响应接口
interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  error?: string
}

// 错误接口
interface ApiError {
  message: string
  status: number
  code?: string
}

/**
 * API 客户端类
 */
export class ApiClient {
  private baseURL: string
  private timeout: number
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []

  constructor(baseURL: string = API_CONFIG.baseURL, timeout: number = API_CONFIG.timeout) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * 获取认证头
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token')
    const apiKey = localStorage.getItem('api_key')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else if (apiKey) {
      headers['X-API-Key'] = apiKey
    }

    return headers
  }

  /**
   * 构建 URL
   */
  private buildURL(url: string, params?: Record<string, any>): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}/${API_CONFIG.version}${url}`
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      return queryString ? `${fullURL}?${queryString}` : fullURL
    }
    
    return fullURL
  }

  /**
   * 发送请求
   */
  private async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    try {
      // 应用请求拦截器
      let finalConfig = config
      for (const interceptor of this.requestInterceptors) {
        finalConfig = await interceptor(finalConfig)
      }

      const { url, method, headers = {}, body, params, timeout = this.timeout } = finalConfig

      // 构建请求配置
      const requestConfig: RequestInit = {
        method,
        headers: {
          ...this.getAuthHeaders(),
          ...headers
        },
        signal: AbortSignal.timeout(timeout)
      }

      // 添加请求体
      if (body && method !== 'GET') {
        requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body)
      }

      // 发送请求
      const response = await fetch(this.buildURL(url, params), requestConfig)

      // 应用响应拦截器
      let finalResponse = response
      for (const interceptor of this.responseInterceptors) {
        finalResponse = await interceptor(finalResponse)
      }

      // 解析响应
      const data = await finalResponse.json()

      if (!finalResponse.ok) {
        throw new ApiError(
          data.message || '请求失败',
          finalResponse.status,
          data.code
        )
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('请求超时', 408)
        }
        throw new ApiError(error.message, 0)
      }
      
      throw new ApiError('未知错误', 0)
    }
  }

  /**
   * GET 请求
   */
  async get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'GET', params })
  }

  /**
   * POST 请求
   */
  async post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'POST', body })
  }

  /**
   * PUT 请求
   */
  async put<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PUT', body })
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'DELETE' })
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PATCH', body })
  }
}

/**
 * API 错误类
 */
class ApiError extends Error {
  public status: number
  public code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// 创建默认 API 客户端实例
export const apiClient = new ApiClient()

// 添加默认拦截器
apiClient.addRequestInterceptor((config) => {
  console.log(`[API] ${config.method} ${config.url}`)
  return config
})

apiClient.addResponseInterceptor((response) => {
  console.log(`[API] Response: ${response.status} ${response.statusText}`)
  return response
})

// 导出类型
export type { ApiResponse, RequestConfig }
export { ApiError }

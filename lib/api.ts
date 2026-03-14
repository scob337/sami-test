import axios, { AxiosError, AxiosResponse } from 'axios'
import { toast } from 'sonner'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/auth/login'
    } else if (error.response?.status === 403) {
      toast.error('ليس لديك صلاحية للقيام بهذا الإجراء')
    } else if (error.response?.status === 404) {
      toast.error('المورد غير موجود')
    } else if (error.response?.status && error.response.status >= 500) {
      toast.error('حدث خطأ في الخادم')
    }
    return Promise.reject(error)
  }
)

export async function apiCall<T = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: unknown,
  options?: any
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await apiClient({
      method,
      url: endpoint,
      data,
      ...options,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: any) =>
    apiCall<T>('GET', endpoint, undefined, options),

  post: <T = unknown>(endpoint: string, data?: unknown, options?: any) =>
    apiCall<T>('POST', endpoint, data, options),

  put: <T = unknown>(endpoint: string, data?: unknown, options?: any) =>
    apiCall<T>('PUT', endpoint, data, options),

  delete: <T = unknown>(endpoint: string, options?: any) =>
    apiCall<T>('DELETE', endpoint, undefined, options),
}

export default api

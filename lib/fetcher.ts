import api from './api'

export const fetcher = async <T = any>(url: string): Promise<T> => {
  try {
    return await api.get<T>(url)
  } catch (error: any) {
    throw error
  }
}

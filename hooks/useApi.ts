import React from 'react'
import useSWR, { SWRConfiguration } from 'swr'
import api from '@/lib/api'

interface UseApiOptions extends SWRConfiguration {
  enabled?: boolean
}

export function useApi<T = unknown>(
  endpoint: string | null,
  options?: UseApiOptions
) {
  const { enabled = true, ...swrOptions } = options || {}

  const { data, error, isLoading, mutate } = useSWR<T>(
    enabled && endpoint ? endpoint : null,
    async (url) => {
      try {
        return await api.get<T>(url)
      } catch (error) {
        throw error
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
      focusThrottleInterval: 300000,
      ...swrOptions,
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate,
    isError: !!error,
  }
}

export function useApiMutation<T = unknown, D = unknown>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const mutate = React.useCallback(
    async (data?: D) => {
      setIsLoading(true)
      setError(null)

      try {
        let response
        if (method === 'POST') {
          response = await api.post<T>(endpoint, data)
        } else if (method === 'PUT') {
          response = await api.put<T>(endpoint, data)
        } else {
          response = await api.delete<T>(endpoint)
        }
        return response
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [endpoint, method]
  )

  return {
    mutate,
    isLoading,
    error,
    isError: !!error,
  }
}

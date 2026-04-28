'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store/auth-store'
import { mutate } from 'swr'
import { fetcher } from '@/lib/fetcher'

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/auth/me`)
        
        if (res.ok) {
          const dbUser = await res.json()
          setUser(dbUser)
          // Prefetch and cache chat sessions + notifications
          prefetchUserData(dbUser)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [setUser, setLoading])

  return <>{children}</>
}

// Prefetch user data into SWR cache so components load instantly
function prefetchUserData(user: any) {
  if (!user) return

  // Prefetch chat sessions (for SupportButton)
  if (!user.isAdmin) {
    mutate('/api/chat/session', fetcher('/api/chat/session'), { revalidate: false })
  }

  // Prefetch notifications (for Header bell icon)
  // const notifUrl = `/api/user/dashboard?userId=${user.id}&email=${encodeURIComponent(user.email || '')}`
  // mutate(notifUrl, fetcher(notifUrl), { revalidate: false })
}

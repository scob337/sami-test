'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth-store'
import { mutate } from 'swr'
import { fetcher } from '@/lib/fetcher'

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Fetch isAdmin and name from DB
          try {
            const res = await fetch(`/api/auth/me`)
            if (res.ok) {
              const dbUser = await res.json()
              const enrichedUser = {
                ...session.user,
                isAdmin: dbUser.isAdmin || false,
                name: dbUser.name || session.user.user_metadata?.full_name || ''
              }
              setUser(enrichedUser)

              // Prefetch and cache chat sessions + notifications
              prefetchUserData(enrichedUser)
            } else {
              setUser(session.user)
            }
          } catch {
            setUser(session.user)
          }
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            const res = await fetch(`/api/auth/me`)
            if (res.ok) {
              const dbUser = await res.json()
              const enrichedUser = {
                ...session.user,
                isAdmin: dbUser.isAdmin || false,
                name: dbUser.name || session.user.user_metadata?.full_name || ''
              }
              setUser(enrichedUser)
              prefetchUserData(enrichedUser)
            } else {
              setUser(session.user)
            }
          } catch {
            setUser(session.user)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setLoading, supabase])

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
  const notifUrl = `/api/user/dashboard?userId=${user.id}&email=${encodeURIComponent(user.email || '')}`
  mutate(notifUrl, fetcher(notifUrl), { revalidate: false })
}

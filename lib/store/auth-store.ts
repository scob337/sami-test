import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabaseClient } from '@/lib/supabase/client'

export interface AuthUser extends User {
  isAdmin?: boolean
  name?: string
}

interface AuthStore {
  user: AuthUser | null
  loading: boolean
  error: string | null
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  logout: async () => {
    try {
      // Call server logout to clear Supabase server cookies
      await fetch('/api/auth/logout', { method: 'POST' })

      // Sign out from client properly
      await supabaseClient.auth.signOut()

      // Clear client-side storages
      try { localStorage.clear() } catch {}
      try { sessionStorage.clear() } catch {}

      set({ user: null, loading: false })
    } catch (err) {
      console.error('Error during logout:', err)
      set({ user: null, loading: false })
    }
  },
}))

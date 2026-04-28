import { create } from 'zustand'

export interface AuthUser {
  id: number | string
  email?: string | null
  phone?: string | null
  name?: string | null
  isAdmin?: boolean
  avatarUrl?: string | null
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
      // Call server logout to clear JWT cookie
      await fetch('/api/auth/logout', { method: 'POST' })

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

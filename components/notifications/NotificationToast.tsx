'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { toast } from 'sonner'
import { Bell, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { cn } from '@/lib/utils'

export function NotificationToast() {
  const { user } = useAuthStore()
  const [lastNotifId, setLastNotifId] = useState<number | null>(null)

  // Only poll if user is logged in and NOT an admin (admins send notifs)
  // Or maybe admins want to see them too? The user said "تظهر للمستخدم الاونلاين"
  const { data: notifications } = useSWR<any[]>(
    user && !user.isAdmin ? '/api/admin/notifications' : null, 
    fetcher, 
    { refreshInterval: 5000 }
  )

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const latest = notifications[0] // Assuming sorted by desc in API
      
      // Initialize lastNotifId on first load to avoid toast storm
      if (lastNotifId === null) {
        setLastNotifId(latest.id)
        return
      }

      if (latest.id > lastNotifId) {
        setLastNotifId(latest.id)
        toast.custom((t) => (
          <div 
            onClick={() => toast.dismiss(t)}
            className="w-72 max-w-[calc(100vw-2rem)] max-h-[60vh] flex flex-col bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all animate-in fade-in slide-in-from-left-5 z-[9999]" 
            dir="rtl"
          >
            <div className="p-3 flex gap-3 items-center border-b border-white/5 bg-white/[0.03]">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Bell className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-black text-xs truncate">{latest.title}</h4>
              </div>
              <X className="w-4 h-4 text-slate-500 hover:text-white transition-colors" />
            </div>
            <div className="p-3 overflow-y-auto custom-scrollbar">
              <p className="text-slate-300 text-[11px] font-bold leading-relaxed">{latest.content}</p>
            </div>
          </div>
        ), {
          duration: 5000,
          position: 'bottom-left'
        })
      }
    }
  }, [notifications, lastNotifId])

  return null
}

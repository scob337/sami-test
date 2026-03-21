'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'

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
        toast(latest.title, {
          description: latest.content,
          duration: 5000,
          icon: <Bell className="w-5 h-5 text-blue-500" />,
          style: {
             direction: 'rtl',
             fontFamily: 'var(--font-cairo)'
          }
        })
      }
    }
  }, [notifications, lastNotifId])

  return null
}

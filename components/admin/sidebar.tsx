'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { supabaseClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  HelpCircle,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const menuItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/admin/dashboard' },
  { icon: BookOpen, label: 'إدارة الكتب', href: '/admin/books' },
  { icon: ClipboardList, label: 'إدارة الاختبارات', href: '/admin/tests' },
  { icon: BookOpen, label: 'إدارة الكورسات', href: '/admin/courses' },
  { icon: HelpCircle, label: 'إدارة الأسئلة', href: '/admin/questions' },
  { icon: MessageSquare, label: 'إدارة التقارير والخبراء', href: '/admin/prompts' },
  { icon: MessageSquare, label: 'دعم العملاء', href: '/admin/support' },
  { icon: typeof Bell !== 'undefined' ? Bell : MessageSquare, label: 'بث الإشعارات', href: '/admin/notifications' },
  { icon: Users, label: 'إدارة المستخدمين', href: '/admin/users' },
]

export function Sidebar({ className, onItemClick }: { className?: string; onItemClick?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: sessions } = useSWR<any[]>('/api/chat/session', fetcher, { refreshInterval: 10000 })
  const unreadChatCount = sessions?.reduce((acc: number, s: any) => acc + (s._count?.messages || 0), 0) || 0

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <aside className={cn("w-72 bg-[#15283c] text-white h-full flex flex-col z-50", className)} dir="rtl">
      {/* Profile Section */}
      {/* <div className="p-6 bg-[#1a334d] mb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-[#ff5722] flex items-center justify-center font-black text-xl shadow-lg">
              A
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#214162]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[1.5px] border border-emerald-500/30 px-2 py-0.5 rounded-md">
                متصل الآن
              </span>
            </div>
          </div>
        </div>
      </div> */}

      {/* <div className="px-6 mb-4">
        <h4 className="text-[#ff5722] text-[11px] font-black uppercase tracking-[3px] opacity-70">القائمة الرئيسية</h4>
      </div> */}

      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-3 scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const isSupport = item.href === '/admin/support'
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isActive
                  ? "bg-[#ff5722] text-white shadow-xl shadow-orange-500/20"
                  : "text-[#99abb4] hover:bg-[#214162] hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-[#ffa726]")} />
              <span className="text-[15px] font-black tracking-tight flex-1">{item.label}</span>
              {isSupport && unreadChatCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-bounce">
                  {unreadChatCount}
                </span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-nav-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full" 
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-[#99abb4] hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border-2 border-transparent transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 text-[#ff9800] group-hover:text-red-500" />
          <span className="text-[15px] font-black tracking-tight group-hover:text-red-500">خروج آمن</span>
        </button>
      </div>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  HelpCircle,
  MessageSquare,
  Users,
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const menuItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/admin/dashboard' },
  { icon: BookOpen, label: 'إدارة الكتب', href: '/admin/books' },
  { icon: ClipboardList, label: 'إدارة الاختبارات', href: '/admin/tests' },
  { icon: HelpCircle, label: 'إدارة الأسئلة', href: '/admin/questions' },
  { icon: MessageSquare, label: 'إدارة التقارير والخبراء', href: '/admin/prompts' },
  { icon: Users, label: 'إدارة المستخدمين', href: '/admin/users' },
]

export function Sidebar({ className, onItemClick }: { className?: string; onItemClick?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className={cn("w-72 bg-[#15283c] text-white h-full flex flex-col z-50", className)} dir="ltr">
      {/* Profile Section */}
      <div className="p-6 bg-[#214162] mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">

            <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#214162]" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">مسؤول النظام</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">متصل</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <h4 className="text-[#ff5722] text-xs font-black uppercase tracking-[2px] mb-4 px-2 text-right">عام</h4>
      </div>

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded transition-all duration-200 group relative",
                isActive
                  ? "bg-[#ff5722] text-white shadow-lg"
                  : "text-[#99abb4] hover:bg-[#214162] hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-[#ff9800] group-hover:text-white")} />
              <span className="text-[14px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5 bg-[#214162]">
        <button className="flex items-center gap-4 px-4 py-3 w-full rounded text-[#99abb4] hover:text-white hover:bg-white/5 transition-all duration-200 group">
          <LogOut className="w-5 h-5 text-[#ff9800] group-hover:text-white" />
          <span className="text-[14px] font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  )
}

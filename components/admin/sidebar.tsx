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
    <aside className={cn("w-72 bg-card/50 backdrop-blur-xl border-l border-border/50 h-full flex flex-col shadow-2xl z-50", className)}>
      <div className="p-8 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 group" onClick={onItemClick}>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20">
            M
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">Sami-Test</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Admin Control</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative",
              pathname === item.href
                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 font-bold"
                : "text-muted-foreground hover:bg-primary/5 hover:text-primary font-semibold"
            )}
          >
            <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
            <span className="text-[15px]">{item.label}</span>
            {pathname === item.href && (
              <motion.div
                layoutId="active-pill"
                className="absolute right-2 w-1.5 h-6 bg-primary-foreground rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50 bg-background/30 backdrop-blur-md">
        <button className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive font-bold transition-all duration-300 group">
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  )
}

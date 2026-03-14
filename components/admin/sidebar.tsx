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

const menuItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/admin' },
  { icon: BookOpen, label: 'إدارة الكتب', href: '/admin/books' },
  { icon: ClipboardList, label: 'إدارة الاختبارات', href: '/admin/tests' },
  { icon: HelpCircle, label: 'إدارة الأسئلة', href: '/admin/questions' },
  { icon: MessageSquare, label: 'إدارة التقارير والخبراء', href: '/admin/prompts' },
  { icon: Users, label: 'إدارة المستخدمين', href: '/admin/users' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-card border-l border-border h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">لوحة الإدارة</h1>
        <p className="text-xs text-muted-foreground mt-1">إدارة المنصة</p>
      </div>
      
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              pathname === item.href && "bg-primary/10 text-primary font-semibold border-r-2 border-primary shadow-sm"
            )}
          >
            <item.icon className={cn("w-5 h-5", pathname === item.href && "text-primary")} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  )
}

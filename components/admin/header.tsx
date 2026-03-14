'use client'

import { Bell, Search, User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="h-20 bg-background/60 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 bg-secondary/50 px-5 py-2.5 rounded-2xl w-96 max-w-full border border-border/50 focus-within:border-primary/50 transition-all duration-300 focus-within:ring-4 focus-within:ring-primary/10 group">
        <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="ابحث عن اختبار، كتاب، مستخدم..." 
          className="bg-transparent border-none focus:outline-none text-[15px] w-full placeholder:text-muted-foreground/70 text-foreground font-medium"
        />
      </div>

      <div className="flex items-center gap-6">
        <ThemeToggle />
        <button className="p-3 hover:bg-primary/10 rounded-2xl text-muted-foreground hover:text-primary transition-all duration-300 relative group">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background animate-pulse" />
        </button>
        <div className="h-10 w-px bg-border/50" />
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-[15px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">المدير</p>
            <p className="text-[11px] font-bold text-muted-foreground leading-tight uppercase tracking-tighter">System Admin</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-xl shadow-primary/5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  )
}

'use client'

import { Bell, Search, User } from 'lucide-react'

export function Header() {
  return (
    <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4 bg-muted/50 px-4 py-2 rounded-xl w-96 max-w-full border border-border/50 focus-within:border-primary/50 transition-colors">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="ابحث عن اختبار، كتاب، مستخدم..." 
          className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-muted-foreground/70 text-foreground"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="h-8 w-px bg-border mx-2" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground leading-tight">المدير</p>
            <p className="text-xs text-muted-foreground leading-tight">admin@example.com</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border-2 border-primary/30 shadow-sm shadow-primary/10">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  )
}

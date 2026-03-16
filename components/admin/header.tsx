'use client'

import { Bell, Search, User, Menu, HelpCircle, MessageSquare, Activity } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sidebar } from './sidebar'
import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <header className="h-[75px] bg-[#1d3550] flex items-center justify-between sticky top-0 z-40 shadow-md">
      {/* Left Area: Toggle & Logo */}
      <div className="flex items-center h-full">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="w-[75px] h-full bg-[#ff5722] flex items-center justify-center text-white hover:bg-[#e64a19] transition-colors lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="px-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-inner">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Sami Test</span>
        </div>
      </div>

      {/* Right Area: Actions & User */}
      <div className="flex items-center h-full gap-2 pr-6">
        <div className="flex items-center gap-1">
          <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-4 h-4 bg-[#ff5722] text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-[#1d3550]">2</span>
          </button>
          <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-4 h-4 bg-[#ffc107] text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-[#1d3550]">3</span>
          </button>
        </div>

        <div className="h-8 w-px bg-white/10 mx-2" />

      </div>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 border-none">
          <Sidebar
            className="w-full shadow-none border-none"
            onItemClick={() => setIsSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </header>
  )
}

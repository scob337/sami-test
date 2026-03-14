'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    logout()
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <header className="bg-background/80 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300">
        <nav className="container flex h-20 items-center justify-between px-8">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-xl shadow-primary/25 group-hover:scale-105 transition-transform">
              M
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">MindMatch</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 bg-secondary/50 p-1.5 rounded-2xl border border-border/40">
            {[
              { name: 'الرئيسية', href: '/' },
              { name: 'الاختبارات', href: '/test-library' },
              { name: 'حول الخدمة', href: '#about' },
              { name: 'المميزات', href: '#features' },
            ].map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className="text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-background px-5 py-2.5 rounded-xl transition-all relative group cursor-pointer"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl">
                    لوحة التحكم
                  </Button>
                </Link>
                <div className="h-8 w-px bg-border/50 mx-1" />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl font-bold"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  خروج
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl cursor-pointer">
                    دخول
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="h-12 px-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 font-black transition-all hover:scale-105 active:scale-95 cursor-pointer">
                    ابدأ الآن
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-3 hover:bg-secondary rounded-2xl transition-colors border border-border/50 cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl rounded-b-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 flex flex-col gap-3">
                {[
                  { name: 'الرئيسية', href: '/' },
                  { name: 'الاختبارات', href: '/test-library' },
                  { name: 'حول الخدمة', href: '#about' },
                  { name: 'المميزات', href: '#features' },
                ].map((link) => (
                  <Link 
                    key={link.name}
                    href={link.href} 
                    className="text-lg font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 p-4 rounded-2xl transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                {!user && (
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-6 border-t border-border/50">
                    <Link href="/auth/login" className="w-full">
                      <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2">دخول</Button>
                    </Link>
                    <Link href="/auth/register" className="w-full">
                      <Button className="w-full h-14 rounded-2xl font-black bg-primary">سجل الآن</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    try {
      router.replace('/')
    } catch { }
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-3 group"
          >

            <span className="text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors"><span className='text-blue-500'>SAMI</span> Test</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2  p-1.5 rounded-2xl border border-border/40">
            {[
              { name: 'الرئيسية', href: '/' },
              { name: 'الاختبارات', href: '/test-library' },
              { name: 'حول الخدمة', href: '#about' },
              { name: 'المميزات', href: '#features' },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-bold text-black dark:text-white hover:bg-background px-5 py-2.5 rounded-xl transition-all relative group cursor-pointer"
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
                <Link href="/dashboard" className="hidden sm:block">
                  <Button className="text-sm font-bold text-black dark:text-white hover:bg-secondary/10 rounded-full">
                    لوحة التحكم
                  </Button>
                </Link>
                <div className="hidden sm:block h-8 w-px bg-border/50 mx-1" />
                <Button
                  size="sm"
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full font-bold"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  خروج
                </Button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Link href="/auth/login">
                  <Button 
                  className="text-sm font-bold  bg-blue-500 hover:bg-blue-600 rounded-full cursor-pointer">
                    دخول
                  </Button>
                </Link>
                <Link
                 href="/auth/register">
                  <Button 
                  className="h-12 px-7 bg-blue-500 hover:bg-blue-600   rounded-2xl shadow-xl shadow-primary/20  transition-all hover:scale-105 active:scale-95 cursor-pointer">
                    ابدأ الآن
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-3  rounded-2xl transition-colors border border-border/50 cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden border-b border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden shadow-2xl"
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
                  className="text-lg font-bold text-black dark:text-white hover:bg-secondary/10 p-4 rounded-xl transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  href="/dashboard"
                  className="text-lg font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/10 p-4 rounded-xl transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  لوحة التحكم
                </Link>
              )}
              {!user && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-6 border-t border-border/50">
                  <Link href="/auth/login" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2">دخول</Button>
                  </Link>
                  <Link href="/auth/register" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-14 rounded-2xl font-black bg-blue-500 text-white">سجل الآن</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    logout()
  }

  return (
    <header className="fixed top-0 z-50 w-full bg-card border-b border-border transition-all duration-300">
      <nav className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
            M
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground transition-colors">MindMatch</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { name: 'الرئيسية', href: '/' },
            { name: 'الاختبارات', href: '/test-library' },
            { name: 'حول الخدمة', href: '#about' },
            { name: 'المميزات', href: '#features' },
          ].map((link) => (
            <Link 
              key={link.name}
              href={link.href} 
              className="text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors relative group cursor-pointer"
            >
              {link.name}
              <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                لوحة التحكم
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <LogOut className="w-4 h-4 ml-2" />
                خروج
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="hidden sm:block">
                <Button variant="ghost" className="text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl cursor-pointer">
                  دخول
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="h-11 px-6 bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl shadow-lg shadow-primary/20 font-bold transition-all hover:-translate-y-0.5 cursor-pointer">
                  تسجيل جديد
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2.5 hover:bg-muted rounded-xl transition-colors border border-border cursor-pointer"
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t border-border overflow-hidden"
          >
            <div className="container py-8 flex flex-col gap-6">
              {[
                { name: 'الرئيسية', href: '/' },
                { name: 'الاختبارات', href: '/test-library' },
                { name: 'حول الخدمة', href: '#about' },
                { name: 'المميزات', href: '#features' },
              ].map((link) => (
                <Link 
                  key={link.name}
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

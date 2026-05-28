'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, Bell, X } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { cn } from '@/lib/utils'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const navLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'الكورسات', href: '/courses' },
    { name: 'الكتب', href: '/books' },
    { name: 'حول الخدمة', href: '/about' },
    { name: 'المميزات', href: '/features' },
  ]

  const { data: notificationsData } = useSWR<any>(
    user 
      ? `/api/user/dashboard?userId=${user.id}&email=${encodeURIComponent(user.email || '')}&phone=${encodeURIComponent(user.phone || '')}` 
      : null,
    fetcher
  )

  const notifications = notificationsData?.notifications || []
  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  const handleLogout = async () => {
    await logout()
    try {
      router.replace('/')
    } catch { }
  }

  return (
    <nav className="glass-nav w-full transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-3 group"
          >
            <img 
              src="/Logo.png" 
              alt="7Types" 
              className="h-10 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-2xl">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-bold text-foreground hover:bg-secondary/50 px-5 py-2.5 rounded-xl transition-all relative group cursor-pointer"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href={user.isAdmin ? "/admin" : "/dashboard"} className="hidden sm:block">
                  <Button className="text-sm font-bold text-secondary-foreground bg-secondary rounded-full">
                    لوحة التحكم
                  </Button>
                </Link>
                
                <div className="relative">
                  <button 
                    onClick={() => {
                        setIsNotificationsOpen(!isNotificationsOpen)
                        if (!isNotificationsOpen && unreadCount > 0) {
                            // Optimistically mark as read in UI (this requires mutating SWR cache or ignoring, but SWR will revalidate)
                            // We trigger the API
                            fetch('/api/user/notifications/read', { method: 'POST' }).then(() => {
                                notifications.forEach((n: any) => n.isRead = true);
                            })
                        }
                    }}
                    className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-background" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <>
                        {/* Mobile Overlay to close on click outside */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setIsNotificationsOpen(false)}
                          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90] lg:hidden"
                        />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={cn(
                            "absolute mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-[100]",
                            // Mobile: Centered relatively to screen, Desktop: Aligned to icon
                            "fixed left-4 right-4 top-20 mx-auto md:absolute md:left-0 md:right-auto md:top-full"
                          )}
                          dir="rtl"
                        >
                          <div className="p-4 border-b border-border bg-muted flex justify-between items-center">
                            <h3 className="font-black text-sm text-foreground">الإشعارات</h3>
                            <button 
                              onClick={() => setIsNotificationsOpen(false)}
                              className="lg:hidden p-1 hover:bg-muted/50 rounded-full"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-muted-foreground text-xs font-bold">لا توجد إشعارات حالياً</div>
                            ) : (
                              notifications.map((n: any, index: number) => (
                                <div key={`${n.id}-${index}`} className="p-4 border-b border-border hover:bg-muted transition-colors">
                                  <h4 className="font-black text-xs mb-1 text-foreground">{n.notification?.title}</h4>
                                  <p className="text-[10px] text-muted-foreground font-medium line-clamp-2">{n.notification?.content}</p>
                                  <span className="text-[8px] text-muted-foreground/60 mt-2 block font-bold">{new Date(n.createdAt).toLocaleDateString('ar-SA')}</span>
                                </div>
                              ))
                            )}
                          </div>
                          <Link href="/dashboard?tab=notifications" onClick={() => setIsNotificationsOpen(false)}>
                            <div className="p-3 text-center bg-primary text-primary-foreground text-[10px] font-black hover:bg-primary/90 transition-colors">
                              عرض الكل في الداشبورد
                            </div>
                          </Link>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="hidden sm:block h-8 w-px border-l border-border mx-1" />
                
                {/* User Avatar & Name */}
                {notificationsData?.user && (
                   <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border border-border">
                     <div className="w-7 h-7 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center overflow-hidden border border-border">
                       {notificationsData.user.avatarUrl ? (
                         <img src={notificationsData.user.avatarUrl} alt={notificationsData.user.name} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-xs font-black text-primary">{notificationsData.user.name?.charAt(0).toUpperCase() || 'U'}</span>
                       )}
                     </div>
                     <span className="text-xs font-bold text-foreground max-w-[100px] truncate">{notificationsData.user.name || 'مستخدم'}</span>
                   </div>
                )}

                <Button
                  size="sm"
                  onClick={handleLogout}
                  className="text-white bg-rose-500 hover:bg-rose-600 rounded-full font-bold shadow-md shadow-rose-500/20"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  خروج
                </Button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Link href="/auth/login">
                  <Button 
                  className="text-sm font-bold bg-muted hover:bg-muted/80 text-foreground rounded-full border border-border cursor-pointer">
                    دخول
                  </Button>
                </Link>
                <Link
                 href="/auth/register">
                  <Button 
                  className="h-12 px-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer">
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
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-bold text-foreground hover:bg-secondary/60 p-4 rounded-xl transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  href={user.isAdmin ? "/admin" : "/dashboard"}
                  className="text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-xl transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  لوحة التحكم
                </Link>
              )}
              {!user && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-6 border-t border-border/50">
                  <Link href="/auth/login" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2 border-border">دخول</Button>
                  </Link>
                  <Link href="/auth/register" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-14 rounded-2xl font-black bg-primary text-primary-foreground shadow-lg shadow-primary/20">سجل الآن</Button>
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

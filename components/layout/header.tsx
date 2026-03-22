'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, Bell } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const { data: notificationsData } = useSWR<any>(
    user 
      ? `/api/user/dashboard?userId=${user.id}&email=${encodeURIComponent(user.email || '')}&phone=${encodeURIComponent(user.user_metadata?.phone || '')}` 
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
              { name: 'الكورسات', href: '/courses' },
              { name: 'الاختبارات', href: '/test-library' },
              { name: 'حول الخدمة', href: '/about' },
              { name: 'المميزات', href: '/features' },
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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-3">
                <Link href={user.isAdmin ? "/admin" : "/dashboard"} className="hidden sm:block">
                  <Button className="text-sm font-bold text-black dark:text-white bg-secondary/50 dark:bg-secondary rounded-full">
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
                    className="relative p-2 text-slate-500 hover:text-blue-500 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 mt-2 w-80 bg-white dark:bg-[#112240] border border-border dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                        dir="rtl"
                      >
                        <div className="p-4 border-b border-border dark:border-white/5 bg-slate-50 dark:bg-white/5">
                          <h3 className="font-black text-sm">الإشعارات</h3>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-xs font-bold">لا توجد إشعارات حالياً</div>
                          ) : (
                            notifications.map((n: any, index: number) => (
                              <div key={`${n.id}-${index}`} className="p-4 border-b border-border dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <h4 className="font-black text-xs mb-1">{n.notification?.title}</h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2">{n.notification?.content}</p>
                                <span className="text-[8px] text-slate-400 mt-2 block font-bold">{new Date(n.createdAt).toLocaleDateString('ar-SA')}</span>
                              </div>
                            ))
                          )}
                        </div>
                        <Link href="/dashboard?tab=notifications" onClick={() => setIsNotificationsOpen(false)}>
                          <div className="p-3 text-center bg-blue-500 text-white text-[10px] font-black hover:bg-blue-600 transition-colors">
                            عرض الكل في الداشبورد
                          </div>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="hidden sm:block h-8 w-px border-l border-slate-200 dark:border-white/10 mx-1" />
                
                {/* User Avatar & Name */}
                {notificationsData?.user && (
                   <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
                     <div className="w-7 h-7 rounded-full bg-blue-500/20 flex flex-shrink-0 items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10">
                       {notificationsData.user.avatarUrl ? (
                         <img src={notificationsData.user.avatarUrl} alt={notificationsData.user.name} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-xs font-black text-blue-500">{notificationsData.user.name?.charAt(0).toUpperCase() || 'U'}</span>
                       )}
                     </div>
                     <span className="text-xs font-bold text-slate-900 dark:text-white max-w-[100px] truncate">{notificationsData.user.name || 'مستخدم'}</span>
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
                { name: 'الكورسات', href: '/courses' },
                { name: 'الاختبارات', href: '/test-library' },
                { name: 'حول الخدمة', href: '/about' },
                { name: 'المميزات', href: '/features' },
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
                  href={user.isAdmin ? "/admin" : "/dashboard"}
                  className="text-lg font-bold bg-blue-500 hover:bg-blue-600 text-black dark:text-white  p-4 rounded-xl transition-all"
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

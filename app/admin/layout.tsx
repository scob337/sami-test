import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  let isAdmin = false
  try {
    if (user.email) {
      // Check admin status in DB
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { isAdmin: true }
      })
      isAdmin = dbUser?.isAdmin || false
    }
  } catch (error) {
    console.error('Database connection error in AdminLayout:', error)
    // If DB check fails in production (e.g. env vars issue), 
    // we fallback to false to avoid crashing the entire server side render.
    isAdmin = false
  }

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen bg-[#f1f5f9] dark:bg-[#0f172a] text-[#1e293b] dark:text-slate-200 font-sans" dir="rtl">
      <Sidebar className="hidden lg:flex" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

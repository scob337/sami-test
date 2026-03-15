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

  // Check admin status in DB
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { isAdmin: true }
  })

  if (!dbUser?.isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen bg-background text-foreground" dir="rtl">
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

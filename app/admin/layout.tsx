import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { UploadManager } from '@/components/admin/upload-manager'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/jwt'
import { findUserById } from '@/lib/db/auth-repository'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session?.id) {
    redirect('/auth/login')
  }

  let isAdmin = false
  try {
    const dbUser = await findUserById(Number(session.id))
    isAdmin = dbUser?.isAdmin || false
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
      <UploadManager />
    </div>
  )
}

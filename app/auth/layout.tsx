import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect('/dashboard')
    }
  } catch (err) {
    const e = err as any
    // Rethrow Next.js internal redirect signal so it isn't treated as an error
    if (e?.digest && String(e.digest).startsWith('NEXT_REDIRECT')) throw err
    console.error('Auth layout session check failed:', err)
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </main>
  )
}

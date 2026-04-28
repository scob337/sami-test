import { redirect } from 'next/navigation'
import { getSession } from '@/lib/jwt'

export const dynamic = 'force-dynamic'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const session = await getSession()
    if (session?.id) {
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
      <div className="flex-1">{children}</div>
    </main>
  )
}

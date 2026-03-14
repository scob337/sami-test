import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Initialize Supabase
    const supabase = await createClient()

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      console.error('Supabase auth error:', error)
      return NextResponse.json(
        { error: error.message || 'بيانات الدخول غير صحيحة', code: (error as any)?.status || null },
        { status: 401 }
      )
    }

    // Get user from Prisma to check admin status
    const prisma = (await import('@/lib/prisma')).default
    const dbUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: { isAdmin: true }
    })

    return NextResponse.json(
      {
        message: 'تم الدخول بنجاح',
        user: {
          ...data.user,
          isAdmin: dbUser?.isAdmin || false
        },
        session: data.session,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء الدخول' },
      { status: 500 }
    )
  }
}

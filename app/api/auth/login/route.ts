import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)

    const prisma = (await import('@/lib/prisma')).default
    let emailForAuth = validatedData.identifier

    // If identifier doesn't look like an email, assume it's a phone number and look up the email
    if (!emailForAuth.includes('@')) {
      const dbUser = await prisma.user.findFirst({
        where: { phone: validatedData.identifier },
        select: { email: true }
      })

      if (dbUser && dbUser.email) {
        emailForAuth = dbUser.email
      } else {
        return NextResponse.json(
          { error: 'لم يتم العثور على حساب بهذا الرقم', code: 'user_not_found' },
          { status: 404 }
        )
      }
    }

    // Initialize Supabase
    const supabase = await createClient()

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailForAuth,
      password: validatedData.password,
    })

    if (error) {
      console.error('Supabase auth error:', error)
      return NextResponse.json(
        { error: error.message || 'بيانات الدخول غير صحيحة', code: (error as any)?.status || null },
        { status: 401 }
      )
    }

    // Ensure user exists in Prisma and sync their metadata
    const prismaUser = await prisma.user.upsert({
      where: { email: emailForAuth },
      update: {
        name: data.user.user_metadata?.fullName || data.user.user_metadata?.name || undefined,
        phone: data.user.user_metadata?.phone || data.user.phone || undefined,
      },
      create: {
        email: emailForAuth,
        name: data.user.user_metadata?.fullName || data.user.user_metadata?.name || '',
        phone: data.user.user_metadata?.phone || data.user.phone || '',
        isAdmin: false
      }
    })

    return NextResponse.json(
      {
        message: 'تم الدخول بنجاح',
        user: {
          ...data.user,
          isAdmin: prismaUser.isAdmin
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

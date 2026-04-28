import { loginSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'
import { comparePassword, setAuthCookie } from '@/lib/auth'
import { findUserByIdentifier } from '@/lib/db/auth-repository'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Find user by email or phone
    const user = await findUserByIdentifier(validatedData.identifier)

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة', code: 'invalid_credentials' },
        { status: 401 }
      )
    }

    // Compare password
    const isPasswordValid = await comparePassword(validatedData.password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة', code: 'invalid_credentials' },
        { status: 401 }
      )
    }

    // Set auth cookie
    await setAuthCookie(user)

    return NextResponse.json(
      {
        message: 'تم الدخول بنجاح',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin: user.isAdmin
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Login error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'حدث خطأ أثناء الدخول' },
      { status: 500 }
    )
  }
}

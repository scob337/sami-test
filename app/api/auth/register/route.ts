import { registerSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, setAuthCookie } from '@/lib/auth'
import { createUser, findUserByEmail, findUserByPhone } from '@/lib/db/auth-repository'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check if user already exists by email
    if (validatedData.email) {
      const existingEmail = await findUserByEmail(validatedData.email)
      if (existingEmail) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 409 }
        )
      }
    }

    // Check if user already exists by phone
    if (validatedData.phone) {
      const existingPhone = await findUserByPhone(validatedData.phone)
      if (existingPhone) {
        return NextResponse.json(
          { error: 'رقم الهاتف مستخدم بالفعل' },
          { status: 409 }
        )
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password!)

    // Create user in PostgreSQL
    const user = await createUser({
      name: validatedData.fullName,
      email: validatedData.email || null,
      phone: validatedData.phone,
      password: hashedPassword,
    })

    // Set auth cookie
    await setAuthCookie(user)

    return NextResponse.json(
      {
        message: 'تم التسجيل بنجاح',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin: user.isAdmin
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'بيانات غير صالحة', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    )
  }
}

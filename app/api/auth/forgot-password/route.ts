import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { findUserByEmail, setResetToken } from '@/lib/db/auth-repository'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })
    }

    const user = await findUserByEmail(email.toLowerCase())

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ message: 'إذا كان البريد الإلكتروني مسجلاً، فستتلقى رابطاً قريباً' })
    }

    const resetToken = crypto.randomUUID()
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    await setResetToken(user.id, resetToken, resetTokenExpiry)

    // Mocking email sending
    console.log(`Password reset requested for ${email}. Token: ${resetToken}`)
    console.log(`Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`)

    return NextResponse.json({ message: 'تم إرسال رابط استعادة كلمة المرور' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'حدث خطأ ما' }, { status: 500 })
  }
}

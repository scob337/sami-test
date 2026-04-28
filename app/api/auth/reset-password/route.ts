import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth'
import { findUserByResetToken, updatePasswordAndClearReset } from '@/lib/db/auth-repository'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'الرابط غير صالح أو كلمة المرور مفقودة' }, { status: 400 })
    }

    const user = await findUserByResetToken(token)

    if (!user) {
      return NextResponse.json({ error: 'انتهت صلاحية الرابط أو أنه غير صالح' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    await updatePasswordAndClearReset(user.id, hashedPassword)

    return NextResponse.json({ message: 'تم تحديث كلمة المرور بنجاح' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'حدث خطأ ما' }, { status: 500 })
  }
}

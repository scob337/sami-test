import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ isEnrolled: false })
    }

    const { id } = await params;

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true }
    })

    if (!dbUser) {
      return NextResponse.json({ isEnrolled: false })
    }

    // Check if user has a completed payment for this course
    const enrollment = await prisma.payment.findFirst({
      where: {
        userId: dbUser.id,
        courseId: parseInt(id),
        status: 'COMPLETED'
      }
    })

    // Also check UserCourse table if we use it for explicit enrollment
    const userCourse = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: dbUser.id,
          courseId: parseInt(id)
        }
      }
    })

    return NextResponse.json({ 
      isEnrolled: !!enrollment || !!userCourse 
    })
  } catch (error) {
    console.error('[ENROLLMENT_CHECK]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

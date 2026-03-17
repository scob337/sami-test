import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const attemptId = searchParams.get('attemptId')

    if (!attemptId) {
      return NextResponse.json({ error: 'Missing attemptId' }, { status: 400 })
    }

    // Get current user to check for re-access
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Fetch the attempt to get the testId and userId
    const attempt = await prisma.attempt.findUnique({
      where: { id: parseInt(attemptId) },
      include: { test: true }
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    // 2. Check if THIS attempt is paid
    const currentPayment = await prisma.payment.findFirst({
      where: { attemptId: parseInt(attemptId), status: 'COMPLETED' } as any
    })

    let isPaid = !!currentPayment

    // 3. If not paid, check if this user has ALREADY paid for this test before (re-access)
    if (!isPaid && user?.email) {
        // Find the Prisma user by email
        const prismaUser = await prisma.user.findUnique({
            where: { email: user.email }
        })

        if (prismaUser) {
            // Check for any completed payment for THIS test by THIS user
            const previousPayment = await prisma.payment.findFirst({
                where: {
                    userId: prismaUser.id,
                    status: 'COMPLETED',
                    OR: [
                        { testId: attempt.testId },
                        { attempt: { testId: attempt.testId } }
                    ]
                } as any
            })
            if (previousPayment) isPaid = true
        }
    }

    const report = await prisma.report.findFirst({
      where: { 
        result: {
          attemptId: parseInt(attemptId)
        }
      }
    })

    if (!report) {
        return NextResponse.json({ status: 'pending', message: 'Report not generated yet' }, { status: 200 })
    }

    // If not paid, only return a partial report
    if (!isPaid) {
      const partialText = report.reportText.substring(0, 500) + '...'
      return NextResponse.json({ 
        ...report, 
        reportText: partialText, 
        isPartial: true,
        isPaid: false
      })
    }

    return NextResponse.json({
        ...report,
        isPartial: false,
        isPaid: true
    })
  } catch (error) {
    console.error('Report fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

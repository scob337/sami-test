import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const manualAttemptId = searchParams.get('attemptId')

    const user = await getAuthenticatedUser()

    if (!user && !manualAttemptId) {
      return NextResponse.json({ error: 'Not authenticated and no attemptId provided' }, { status: 401 })
    }

    // 2. Find the attempt
    let attemptToMark = null
    if (manualAttemptId) {
      attemptToMark = await prisma.attempt.findUnique({
        where: { id: parseInt(manualAttemptId) },
        include: { test: true }
      })
    } else if (user) {
      attemptToMark = await prisma.attempt.findFirst({
        where: { userId: user.id },
        orderBy: { startedAt: 'desc' },
        include: { test: true }
      })
    }

    if (!attemptToMark) {
      return NextResponse.json({ 
        error: 'Attempt not found', 
        debug: { authEmail: user?.email, prismaUserId: user?.id } 
      }, { status: 404 })
    }

    // 3. OWNERSHIP TRANSFER: If current prisma user exists, force this attempt to THEM
    if (user && attemptToMark.userId !== user.id) {
       await prisma.attempt.update({
         where: { id: attemptToMark.id },
         data: { userId: user.id }
       })
       attemptToMark.userId = user.id
    }

    // 4. Mark as paid + Link Book
    const test = attemptToMark.test
    const payment = await prisma.payment.upsert({
      where: { attemptId: attemptToMark.id },
      create: {
        attemptId: attemptToMark.id,
        userId: attemptToMark.userId,
        bookId: test.bookId, // Link the book!
        amount: 10.0,
        status: 'COMPLETED'
      },
      update: {
        status: 'COMPLETED',
        bookId: test.bookId,
        userId: attemptToMark.userId
      }
    })

    // 5. Update attempt status
    await prisma.attempt.update({
      where: { id: attemptToMark.id },
      data: { status: 'COMPLETED' }
    })

    return NextResponse.json({
      message: 'Successfully marked attempt as PAID and synced to your account',
      details: {
        attemptId: attemptToMark.id,
        testName: test.name,
        bookId: test.bookId,
        userEmail: user?.email,
        prismaUserId: attemptToMark.userId,
        paymentId: payment.id
      }
    })

  } catch (error) {
    console.error('Debug mark-paid error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

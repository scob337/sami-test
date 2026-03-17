import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const manualAttemptId = searchParams.get('attemptId')

    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser && !manualAttemptId) {
      return NextResponse.json({ error: 'Not authenticated and no attemptId provided' }, { status: 401 })
    }

    // 1. Get/Create Prisma User for current auth user
    let prismaUser = null
    if (authUser?.email) {
      prismaUser = await prisma.user.findUnique({
        where: { email: authUser.email }
      })
      
      if (!prismaUser) {
        prismaUser = await prisma.user.create({
          data: {
            email: authUser.email,
            name: authUser.user_metadata?.fullName || authUser.email.split('@')[0],
            phone: authUser.user_metadata?.phone || ''
          }
        })
      }
    }

    // 2. Find the attempt
    let attemptToMark = null
    if (manualAttemptId) {
      attemptToMark = await prisma.attempt.findUnique({
        where: { id: parseInt(manualAttemptId) },
        include: { test: true }
      })
    } else if (prismaUser) {
      attemptToMark = await prisma.attempt.findFirst({
        where: { userId: prismaUser.id },
        orderBy: { startedAt: 'desc' },
        include: { test: true }
      })
    }

    if (!attemptToMark) {
      return NextResponse.json({ 
        error: 'Attempt not found', 
        debug: { authEmail: authUser?.email, prismaUserId: prismaUser?.id } 
      }, { status: 404 })
    }

    // 3. OWNERSHIP TRANSFER: If current prisma user exists, force this attempt to THEM
    if (prismaUser && attemptToMark.userId !== prismaUser.id) {
       await prisma.attempt.update({
         where: { id: attemptToMark.id },
         data: { userId: prismaUser.id }
       })
       attemptToMark.userId = prismaUser.id
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
        userEmail: authUser?.email,
        prismaUserId: attemptToMark.userId,
        paymentId: payment.id
      }
    })

  } catch (error) {
    console.error('Debug mark-paid error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true }
    })

    if (!dbUser) {
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    const { attemptId, itemId, testId, kind, discountCodeId } = await req.json()
    const userId = dbUser.id


    if (kind === 'course') {
        let courseId = parseInt(itemId);
        if (isNaN(courseId)) {
            const course = await prisma.course.findUnique({ where: { slug: itemId } });
            if (course) courseId = course.id;
        }

        if (isNaN(courseId)) {
            return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
        }

        await prisma.payment.create({
            data: {
                status: 'COMPLETED',
                amount: 0,
                userId: userId,
                courseId: courseId,
                discountCodeId: discountCodeId ? parseInt(discountCodeId) : undefined
            }
        });
        
        await prisma.userCourse.upsert({
            where: { userId_courseId: { userId: userId, courseId } },
            update: {},
            create: { userId: userId, courseId }
        });

        return NextResponse.json({ redirectUrl: `/courses/${itemId}` })
    }

    const paymentPayload: any = {
        status: 'COMPLETED',
        amount: 0,
        userId: userId,
        testId: testId ? parseInt(testId) : undefined,
        attemptId: attemptId ? parseInt(attemptId) : undefined,
        discountCodeId: discountCodeId ? parseInt(discountCodeId) : undefined
    }

    if (attemptId) {
        const existingPayment = await prisma.payment.findUnique({
            where: { attemptId: parseInt(attemptId) }
        });
        if (existingPayment) {
            await prisma.payment.update({
                where: { id: existingPayment.id },
                data: paymentPayload
            })
        } else {
            await prisma.payment.create({ data: paymentPayload })
        }
    } else {
        await prisma.payment.create({ data: paymentPayload })
    }

    const redirectUrl = attemptId 
        ? `/results?attemptId=${attemptId}&paid=true` 
        : `/test?testId=${testId}`

    return NextResponse.json({ redirectUrl })
  } catch (error) {
    console.error('Free payment error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

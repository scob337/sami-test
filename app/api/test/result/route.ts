import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const attemptId = searchParams.get('attemptId')

    if (!attemptId) {
      return NextResponse.json({ error: 'Missing attemptId' }, { status: 400 })
    }

    const id = parseInt(attemptId)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid attemptId' }, { status: 400 })
    }

    const result = await (prisma.result.findUnique as any)({
      where: { attemptId: id },
      include: {
        attempt: {
          include: {
            test: {
              include: {
                book: true
              }
            },
            payment: true,
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching result:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

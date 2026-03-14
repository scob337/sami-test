import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('testId')

    if (!testId) {
      return NextResponse.json({ error: 'testId is required' }, { status: 400 })
    }

    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) },
      select: {
        id: true,
        name: true
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error fetching test info:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

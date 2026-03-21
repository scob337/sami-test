import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const tests = await prisma.test.findMany({
      include: {
        book: true,
        _count: {
          select: { questions: true }
        }
      }
    })
    return NextResponse.json(tests)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, bookId } = body

    if (!name || !bookId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    const test = await (prisma as any).test.create({
      data: {
        name,
        slug: slugify(name),
        bookId: parseInt(bookId),
      }
    })

    return NextResponse.json(test)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

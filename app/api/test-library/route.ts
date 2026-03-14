import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      where: { isActive: true },
      include: {
        tests: {
          where: { isActive: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching test library:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

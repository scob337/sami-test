import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const isNumericId = /^\d+$/.test(id);
      const book = await (prisma as any).book.findFirst({
        where: isNumericId ? { id: parseInt(id), isActive: true } : { slug: id, isActive: true },
        include: {
          tests: {
            where: { isActive: true },
          },
        },
      })

      if (!book) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 })
      }

      return NextResponse.json(book)
    }

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

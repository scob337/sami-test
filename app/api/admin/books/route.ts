import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      include: {
        _count: {
          select: { tests: true, payments: true }
        }
      }
    })
    return NextResponse.json(books)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, filePdf } = body

    if (!title || !filePdf) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    const book = await (prisma as any).book.create({
      data: {
        title,
        slug: slugify(title),
        filePdf,
      }
    })

    return NextResponse.json(book)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

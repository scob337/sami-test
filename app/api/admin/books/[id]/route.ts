import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const isNumericId = /^\d+$/.test(id)
    const book = await (prisma as any).book.findFirst({
      where: isNumericId ? { id: parseInt(id) } : { slug: id },
      include: { tests: true },
    })
    if (!book) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(book)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, filePdf, price, isActive, slug } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const isNumericId = /^\d+$/.test(id)
    const book = await (prisma as any).book.update({
      where: isNumericId ? { id: parseInt(id) } : { slug: id },
      data: {
        title,
        slug: slug || (title ? slugify(title) : undefined),
        description: description ?? null,
        filePdf: filePdf ?? '',
        price: price ?? 0,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const isNumericId = /^\d+$/.test(id)
    await (prisma as any).book.delete({
      where: isNumericId ? { id: parseInt(id) } : { slug: id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

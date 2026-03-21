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
    const test = await (prisma as any).test.findFirst({
      where: isNumericId ? { id: parseInt(id) } : { slug: id },
      include: { book: true },
    })
    if (!test) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(test)
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
    const { name, bookId, isActive, slug } = body

    if (!name || !bookId) {
      return NextResponse.json({ error: 'Name and bookId are required' }, { status: 400 })
    }

    const isNumericId = /^\d+$/.test(id)
    const test = await (prisma as any).test.update({
      where: isNumericId ? { id: parseInt(id) } : { slug: id },
      data: {
        name,
        slug: slug || (name ? slugify(name) : undefined),
        bookId: parseInt(bookId),
        isActive: isActive ?? true,
      },
      include: { book: true },
    })

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error updating test:', error)
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
    await (prisma as any).test.delete({
      where: isNumericId ? { id: parseInt(id) } : { slug: id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

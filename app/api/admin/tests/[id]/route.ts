import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const test = await prisma.test.findUnique({
      where: { id: parseInt(id) },
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
    const { name, bookId, isActive } = body

    if (!name || !bookId) {
      return NextResponse.json({ error: 'Name and bookId are required' }, { status: 400 })
    }

    const test = await prisma.test.update({
      where: { id: parseInt(id) },
      data: {
        name,
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
    await prisma.test.delete({
      where: { id: parseInt(id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

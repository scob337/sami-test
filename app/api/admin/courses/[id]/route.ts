import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json()
    const { title, description, price, image, introVideoUrl, introThumbnailUrl, isActive } = body

    const course = await (prisma as any).course.update({
      where: { id: parseInt(id) },
      data: {
        title,
        slug: title ? slugify(title) : undefined,
        description,
        price: parseFloat(price) || 0,
        image,
        introVideoUrl,
        introThumbnailUrl,
        isActive
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error('[COURSE_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isNumericId = /^\d+$/.test(id);
    await (prisma as any).course.delete({
      where: isNumericId ? { id: parseInt(id) } : { slug: id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[COURSE_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isNumericId = /^\d+$/.test(id);
    const course = await (prisma as any).course.findFirst({
      where: isNumericId ? { id: parseInt(id) } : { slug: id },
      include: {
        discountCodes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!course) {
        return new NextResponse('Not Found', { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('[COURSE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let courseId = parseInt(id)
    if (isNaN(courseId)) {
      const course = await prisma.course.findUnique({ where: { slug: id }, select: { id: true } })
      if (!course) return new NextResponse('Invalid ID or Slug', { status: 400 })
      courseId = course.id
    }

    const user = await getAuthenticatedUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { value, comment } = await req.json()
    if (!value || value < 1 || value > 5) {
      return new NextResponse('Invalid rating value', { status: 400 })
    }

    // Check if user already rated this course
    const existingRating = await (prisma as any).rating.findFirst({
      where: {
        userId: user.id,
        courseId
      }
    })

    let rating
    if (existingRating) {
      // Update existing rating
      rating = await (prisma as any).rating.update({
        where: { id: existingRating.id },
        data: { value, comment: comment || null }
      })
    } else {
      // Create new rating
      rating = await (prisma as any).rating.create({
        data: {
          value,
          comment: comment || null,
          userId: user.id,
          courseId
        }
      })
    }

    return NextResponse.json(rating)
  } catch (error) {
    console.error('[RATINGS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let courseId = parseInt(id)
    if (isNaN(courseId)) {
      const course = await prisma.course.findUnique({ where: { slug: id }, select: { id: true } })
      if (!course) return new NextResponse('Invalid ID or Slug', { status: 400 })
      courseId = course.id
    }

    const user = await getAuthenticatedUser()

    if (!user) {
      return NextResponse.json({ userRating: null })
    }

    const userRating = await (prisma as any).rating.findFirst({
      where: {
        userId: user.id,
        courseId
      }
    })

    return NextResponse.json({ userRating })
  } catch (error) {
    console.error('[RATINGS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

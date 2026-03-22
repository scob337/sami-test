import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

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

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { value, comment } = await req.json()
    if (!value || value < 1 || value > 5) {
      return new NextResponse('Invalid rating value', { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!dbUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Check if user already rated this course
    const existingRating = await (prisma as any).rating.findFirst({
      where: {
        userId: dbUser.id,
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
          userId: dbUser.id,
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

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ userRating: null })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!dbUser) {
      return NextResponse.json({ userRating: null })
    }

    const userRating = await (prisma as any).rating.findFirst({
      where: {
        userId: dbUser.id,
        courseId
      }
    })

    return NextResponse.json({ userRating })
  } catch (error) {
    console.error('[RATINGS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

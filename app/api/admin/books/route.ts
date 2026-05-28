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
    const { 
      title, filePdf, description, price, reportPrice, bookOnlyPrice, isActive, slug,
      heroSubtitle, heroTitle, heroDescription, heroImage, expertName,
      features, audience, steps, assistant, bookDetails, pricingPlans,
      ctaTitle, ctaDescription
    } = body

    if (!title || !filePdf) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    const book = await prisma.book.create({
      data: {
        title,
        slug: slug || slugify(title),
        description,
        filePdf,
        price: parseFloat(price) || 0,
        reportPrice: parseFloat(reportPrice) || 0,
        bookOnlyPrice: parseFloat(bookOnlyPrice) || 0,
        isActive: isActive !== undefined ? isActive : true,
        heroSubtitle,
        heroTitle,
        heroDescription,
        heroImage,
        expertName,
        features: features || [],
        audience: audience || [],
        steps: steps || [],
        assistant: assistant || {},
        bookDetails: bookDetails || {},
        pricingPlans: pricingPlans || [],
        ctaTitle,
        ctaDescription
      }
    })

    return NextResponse.json(book)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

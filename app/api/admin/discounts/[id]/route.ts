import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await (prisma as any).discountCode.delete({
      where: { id: parseInt(id) }
    })

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('[DISCOUNT_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

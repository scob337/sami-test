import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') // Moyasar payment ID
    const status = searchParams.get('status')
    const message = searchParams.get('message')
    
    // In a real implementation, we should verify the payment with Moyasar API using the secret key
    // But for this integration, if status is 'paid', we trust the redirect for now 
    // and ideally perform a server-to-server check.
    
    if (status !== 'paid') {
      return NextResponse.redirect(new URL('/checkout?error=payment_failed', request.url))
    }

    // Retrieve the attemptId from metadata or session if possible. 
    // Moyasar allows passing custom data. We'll expect attemptId in the callback if we pass it.
    // For now, let's look at how we'll handle the redirect.
    
    // Re-verifying server-side is crucial
    const secretKey = process.env.MOYASAR_SECRET_KEY
    const auth = Buffer.from(secretKey + ':').toString('base64')
    
    const response = await fetch(`https://api.moyasar.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    })
    
    if (!response.ok) {
        throw new Error('Failed to verify payment with Moyasar')
    }
    
    const paymentData = await response.json()
    
    if (paymentData.status !== 'paid') {
        return NextResponse.redirect(new URL('/checkout?error=payment_not_paid', request.url))
    }

    // Extract attemptId from metadata
    const attemptId = paymentData.metadata?.attemptId
    const userId = paymentData.metadata?.userId

    if (attemptId) {
        // Create or update payment record
        // Use findFirst + update/create because attemptId might not be in PaymentWhereUniqueInput
        const existingPayment = await prisma.payment.findFirst({
            where: { attemptId: parseInt(attemptId) } as any
        })

        if (existingPayment) {
            await prisma.payment.update({
                where: { id: existingPayment.id },
                data: {
                    status: 'COMPLETED',
                    amount: paymentData.amount / 100,
                }
            })
        } else {
            await prisma.payment.create({
                data: {
                    userId: parseInt(userId),
                    attemptId: parseInt(attemptId),
                    amount: paymentData.amount / 100,
                    status: 'COMPLETED'
                } as any
            })
        }
        
        return NextResponse.redirect(new URL(`/results?attemptId=${attemptId}&paid=true`, request.url))
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
    
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.redirect(new URL('/checkout?error=verification_error', request.url))
  }
}

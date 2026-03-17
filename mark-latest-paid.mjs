import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Find the latest attempt
  const latestAttempt = await prisma.attempt.findFirst({
    orderBy: { startedAt: 'desc' },
    include: { user: true }
  })

  if (!latestAttempt) {
    console.log('No attempts found in database.')
    return
  }

  console.log(`Found latest attempt ID: ${latestAttempt.id} for user: ${latestAttempt.user.email || latestAttempt.user.name}`)

  // 2. Mark it as COMPLETED and ensure payment exists
  const payment = await prisma.payment.upsert({
    where: { attemptId: latestAttempt.id },
    create: {
      attemptId: latestAttempt.id,
      userId: latestAttempt.userId,
      amount: 10.0, // Arbitrary amount
      status: 'COMPLETED'
    },
    update: {
      status: 'COMPLETED'
    }
  })

  // 3. Update attempt status to COMPLETED just in case
  await prisma.attempt.update({
    where: { id: latestAttempt.id },
    data: { status: 'COMPLETED' }
  })

  console.log(`Successfully marked Attempt ${latestAttempt.id} as PAID (COMPLETED).`)
  console.log('Payment details:', payment)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

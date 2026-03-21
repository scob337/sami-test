import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  console.log('Prisma Models:', Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')))
  try {
    const count = await (prisma as any).notification.count()
    console.log('Notification count:', count)
  } catch (e: any) {
    console.error('Error accessing notification:', e.message)
  }
  await prisma.$disconnect()
}

main()

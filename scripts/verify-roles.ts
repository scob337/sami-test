import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool as any)
  const prisma = new PrismaClient({ adapter })

  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@admin.com' },
      select: { email: true, isAdmin: true }
    })
    console.log('Admin user found:', admin)
    
    // Also try to find a regular user for comparison
    const regularUser = await prisma.user.findFirst({
      where: { isAdmin: false },
      select: { email: true, isAdmin: true }
    })
    console.log('Regular user found:', regularUser)
  } catch (err) {
    console.error('Error querying database:', err)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()

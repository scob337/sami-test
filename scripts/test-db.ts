import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Attempting to connect to DB...')
    const userCount = await prisma.user.count()
    console.log('Connection successful! User count:', userCount)
  } catch (error) {
    console.error('DB Connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

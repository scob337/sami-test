import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.warn('[Prisma] DATABASE_URL is missing from environment variables')
    return new PrismaClient() // fallback, but will likely error
  }

  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool as any)
  
  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
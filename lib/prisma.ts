import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.warn('[Prisma] DATABASE_URL is missing from environment variables')
    return null
  }

  try {
    const pool = new pg.Pool({ connectionString })
    // Basic connectivity check to avoid deferred crashes
    pool.on('error', (err) => console.error('[Prisma] Unexpected pool error:', err))
    
    const adapter = new PrismaPg(pool as any)
    return new PrismaClient({ adapter })
  } catch (error) {
    console.error('[Prisma] Failed to initialize PrismaClient:', error)
    return null
  }
}

declare global {
  var prismaGlobal: any
}

// Lazy initialization via Proxy to prevent crash on module import
const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (globalThis.prismaGlobal === undefined || globalThis.prismaGlobal === null) {
      const client = prismaClientSingleton()
      if (!client) {
        // Return a dummy function/object that throws on call to prevent "cannot read property of null"
        return (...args: any[]) => {
          throw new Error(`Prisma access failed: DATABASE_URL is missing or invalid. Action: ${String(prop)}`)
        }
      }
      globalThis.prismaGlobal = client
    }
    
    const value = (globalThis.prismaGlobal as any)[prop]
    if (typeof value === 'function') {
      return value.bind(globalThis.prismaGlobal)
    }
    return value
  }
})

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = globalThis.prismaGlobal ?? null

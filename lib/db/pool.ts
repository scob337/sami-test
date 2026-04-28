import { Pool, type PoolClient, type QueryResultRow } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const globalForPg = globalThis as unknown as {
  pgPool?: Pool
}

const createPool = () =>
  new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX ?? 20),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS ?? 30000),
    connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS ?? 10000),
    allowExitOnIdle: process.env.NODE_ENV !== 'production',
  })

export const pool = globalForPg.pgPool ?? createPool()

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  return pool.query<T>(text, params)
}

export async function withTransaction<T>(handler: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await handler(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

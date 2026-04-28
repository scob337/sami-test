import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const truncateBeforeImport = process.env.MIGRATION_TRUNCATE === 'true'

const BATCH_SIZE = 500

export function quoteIdentifier(name) {
  return `"${name.replace(/"/g, '""')}"`
}

export function buildInsert(tableName, columns, rows) {
  const values = []
  const tuples = rows.map((row, rowIndex) => {
    const tuple = columns.map((col, colIndex) => {
      values.push(row[col])
      const index = rowIndex * columns.length + colIndex + 1
      return `$${index}`
    })
    return `(${tuple.join(', ')})`
  })

  const quotedColumns = columns.map(quoteIdentifier).join(', ')
  return {
    text: `INSERT INTO ${quoteIdentifier(tableName)} (${quotedColumns}) VALUES ${tuples.join(', ')}`,
    values,
  }
}

async function getPublicTables(pool) {
  const { rows } = await pool.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name <> '_prisma_migrations'
      ORDER BY table_name
    `,
  )
  return rows.map((row) => row.table_name)
}

async function tableExists(pool, tableName) {
  const { rows } = await pool.query(`SELECT to_regclass($1) AS regclass`, [`public.${tableName}`])
  return Boolean(rows[0]?.regclass)
}

async function migrateTable(source, target, tableName) {
  const sourceRows = await source.query(`SELECT * FROM ${quoteIdentifier(tableName)}`)
  if (sourceRows.rows.length === 0) {
    console.log(`Skip ${tableName}: empty table`)
    return
  }

  const columns = Object.keys(sourceRows.rows[0])
  if (columns.length === 0) {
    console.log(`Skip ${tableName}: no columns`)
    return
  }

  const targetClient = await target.connect()
  try {
    await targetClient.query('BEGIN')
    if (truncateBeforeImport) {
      await targetClient.query(`TRUNCATE TABLE ${quoteIdentifier(tableName)} RESTART IDENTITY CASCADE`)
    }

    for (let i = 0; i < sourceRows.rows.length; i += BATCH_SIZE) {
      const batch = sourceRows.rows.slice(i, i + BATCH_SIZE)
      const insert = buildInsert(tableName, columns, batch)
      await targetClient.query(insert.text, insert.values)
    }

    await targetClient.query('COMMIT')
    console.log(`Migrated ${tableName}: ${sourceRows.rows.length} rows`)
  } catch (error) {
    await targetClient.query('ROLLBACK')
    throw error
  } finally {
    targetClient.release()
  }
}

async function main() {
  const sourceConnectionString = process.env.SUPABASE_DATABASE_URL
  const targetConnectionString = process.env.DATABASE_URL

  if (!sourceConnectionString || !targetConnectionString) {
    console.error('Missing required env vars: SUPABASE_DATABASE_URL and/or DATABASE_URL')
    process.exit(1)
  }

  const source = new pg.Pool({ connectionString: sourceConnectionString })
  const target = new pg.Pool({ connectionString: targetConnectionString })

  try {
    const sourceTables = await getPublicTables(source)
    for (const table of sourceTables) {
      const existsInTarget = await tableExists(target, table)
      if (!existsInTarget) {
        console.log(`Skip ${table}: missing in target schema`)
        continue
      }
      await migrateTable(source, target, table)
    }
    console.log('Data migration completed successfully.')
  } finally {
    await source.end()
    await target.end()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
}

import test from 'node:test'
import assert from 'node:assert/strict'
import pg from 'pg'

const connectionString = process.env.TEST_DATABASE_URL
const shouldRun = Boolean(connectionString)

test('postgres basic auth-like flow works', { skip: !shouldRun }, async () => {
  const pool = new pg.Pool({ connectionString })
  const email = `integration_${Date.now()}@example.com`

  try {
    await pool.query(
      `
        INSERT INTO "User" (name, email, phone, password, "isAdmin", "createdAt")
        VALUES ($1, $2, $3, $4, false, NOW())
      `,
      ['Integration User', email, `${Date.now()}`, 'hashed-password'],
    )

    const found = await pool.query(
      `
        SELECT id, email, password, "isAdmin"
        FROM "User"
        WHERE email = $1
      `,
      [email],
    )

    assert.equal(found.rows.length, 1)
    assert.equal(found.rows[0].email, email)
    assert.equal(found.rows[0].isAdmin, false)

    await pool.query(
      `
        UPDATE "User"
        SET "resetToken" = $1, "resetTokenExpiry" = NOW() + interval '1 hour'
        WHERE email = $2
      `,
      ['token-123', email],
    )

    const reset = await pool.query(
      `
        SELECT "resetToken"
        FROM "User"
        WHERE email = $1
      `,
      [email],
    )
    assert.equal(reset.rows[0].resetToken, 'token-123')
  } finally {
    await pool.query(`DELETE FROM "User" WHERE email = $1`, [email])
    await pool.end()
  }
})

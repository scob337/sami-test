import type { QueryResultRow } from 'pg'
import { query } from '@/lib/db/pool'

export type AuthUser = {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  password: string | null
  isAdmin: boolean
}

type UserRow = QueryResultRow & AuthUser

export async function findUserByIdentifier(identifier: string) {
  const result = await query<UserRow>(
    `
      SELECT id, name, email, phone, password, "isAdmin"
      FROM "User"
      WHERE LOWER(COALESCE(email, '')) = LOWER($1)
         OR phone = $1
      LIMIT 1
    `,
    [identifier.trim()],
  )

  return result.rows[0] ?? null
}

export async function findUserByEmail(email: string) {
  const result = await query<UserRow>(
    `
      SELECT id, name, email, phone, password, "isAdmin"
      FROM "User"
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email.trim()],
  )
  return result.rows[0] ?? null
}

export async function findUserByPhone(phone: string) {
  const result = await query<UserRow>(
    `
      SELECT id, name, email, phone, password, "isAdmin"
      FROM "User"
      WHERE phone = $1
      LIMIT 1
    `,
    [phone.trim()],
  )
  return result.rows[0] ?? null
}

export async function createUser(input: {
  name: string
  email?: string | null
  phone: string
  password: string
}) {
  const result = await query<UserRow>(
    `
      INSERT INTO "User" (name, email, phone, password, "isAdmin", "createdAt")
      VALUES ($1, NULLIF($2, ''), $3, $4, false, NOW())
      RETURNING id, name, email, phone, password, "isAdmin"
    `,
    [input.name, input.email ?? null, input.phone, input.password],
  )
  return result.rows[0]
}

export async function findUserById(id: number) {
  const result = await query<UserRow>(
    `
      SELECT id, name, email, phone, password, "isAdmin"
      FROM "User"
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  )
  return result.rows[0] ?? null
}

export async function setResetToken(userId: number, token: string, expiry: Date) {
  await query(
    `
      UPDATE "User"
      SET "resetToken" = $1, "resetTokenExpiry" = $2
      WHERE id = $3
    `,
    [token, expiry, userId],
  )
}

export async function findUserByResetToken(token: string) {
  const result = await query<UserRow>(
    `
      SELECT id, name, email, phone, password, "isAdmin"
      FROM "User"
      WHERE "resetToken" = $1
        AND "resetTokenExpiry" > NOW()
      LIMIT 1
    `,
    [token],
  )
  return result.rows[0] ?? null
}

export async function updatePasswordAndClearReset(userId: number, hashedPassword: string) {
  await query(
    `
      UPDATE "User"
      SET password = $1,
          "resetToken" = NULL,
          "resetTokenExpiry" = NULL
      WHERE id = $2
    `,
    [hashedPassword, userId],
  )
}

import test from 'node:test'
import assert from 'node:assert/strict'
import { buildInsert, quoteIdentifier } from '../../scripts/migrate-supabase-to-postgres.mjs'

test('quoteIdentifier escapes double quotes', () => {
  assert.equal(quoteIdentifier('User'), '"User"')
  assert.equal(quoteIdentifier('weird"name'), '"weird""name"')
})

test('buildInsert builds parameterized SQL and values', () => {
  const rows = [
    { id: 1, name: 'A' },
    { id: 2, name: 'B' },
  ]

  const query = buildInsert('User', ['id', 'name'], rows)

  assert.equal(
    query.text,
    'INSERT INTO "User" ("id", "name") VALUES ($1, $2), ($3, $4)',
  )
  assert.deepEqual(query.values, [1, 'A', 2, 'B'])
})

const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })
const prisma = new PrismaClient()

async function checkPolicies() {
  try {
    const policies = await prisma.$queryRawUnsafe(`
      SELECT policyname, cmd, roles, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'storage' AND tablename = 'objects'
    `)
    console.log(JSON.stringify(policies, null, 2))
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

checkPolicies()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTests() {
  const books = await prisma.book.findMany({
    select: { id: true, title: true, isActive: true, _count: { select: { tests: true } } }
  })
  const tests = await prisma.test.findMany({
    select: { id: true, name: true, isActive: true, bookId: true }
  })
  
  console.log('--- Books ---')
  console.log(JSON.stringify(books, null, 2))
  console.log('--- Tests ---')
  console.log(JSON.stringify(tests, null, 2))
}

checkTests().catch(console.error).finally(() => prisma.$disconnect())

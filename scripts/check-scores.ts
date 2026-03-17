import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const questions = await prisma.question.findMany({
    include: {
      options: {
        include: {
          scores: true
        }
      }
    }
  })

  console.log(`Total questions: ${questions.length}`)
  
  questions.forEach(q => {
    q.options.forEach(o => {
      if (o.scores.length === 0) {
        console.log(`WARNING: Question ${q.id} ("${q.questionText}"), Option ${o.id} ("${o.optionText}") has NO score!`)
      }
    })
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

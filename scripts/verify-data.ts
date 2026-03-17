import { PatternType } from '@prisma/client'
import prisma from '../lib/prisma'
import * as dotenv from 'dotenv'
import path from 'path'

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const PATTERN_MAPPING = [
  PatternType.ASSERTIVE,   // 1
  PatternType.PRECISE,     // 2
  PatternType.CALM,        // 3
  PatternType.WISE,        // 4
  PatternType.THINKER,     // 5
  PatternType.SPONTANEOUS, // 6
  PatternType.OPEN         // 7
]

async function main() {
  console.log('--- Starting Personality Test Data Verification ---')

  const questions = await prisma.question.findMany({
    include: {
      options: {
        include: { scores: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })

  console.log(`Checking ${questions.length} questions...`)

  for (const q of questions) {
    if (q.options.length !== 7) {
      console.warn(`[WARNING] Question ${q.id} has ${q.options.length} options (Expected 7).`)
      continue
    }

    for (let i = 0; i < 7; i++) {
      const option = q.options[i]
      const expectedPattern = PATTERN_MAPPING[i]
      
      const currentScore = option.scores.find(s => s.pattern === expectedPattern)
      
      if (!currentScore || currentScore.score !== 1) {
        console.log(`[FIXING] Option ${option.id} (${i+1}) mapping for pattern ${expectedPattern}...`)
        
        // Remove existing scores for this option
        await prisma.optionScore.deleteMany({
          where: { optionId: option.id }
        })

        // Add correct score
        await prisma.optionScore.create({
          data: {
            optionId: option.id,
            pattern: expectedPattern,
            score: 1
          }
        })
      }
    }
  }

  console.log('--- Verification Complete ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

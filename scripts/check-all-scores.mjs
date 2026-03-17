import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tests = await prisma.test.findMany({
    include: {
      questions: {
        include: {
          options: {
            include: {
              scores: true
            }
          }
        }
      }
    }
  });

  for (const test of tests) {
    console.log(`\nChecking Test: ${test.name} (ID: ${test.id})`);
    let missingOrZero = 0;
    
    test.questions.forEach(q => {
      q.options.forEach(o => {
        if (o.scores.length === 0) {
          console.log(`  MISSING: Q"${q.questionText.slice(0, 30)}..." O"${o.optionText.slice(0, 30)}..." (OptID: ${o.id})`);
          missingOrZero++;
        } else {
          const totalScore = o.scores.reduce((sum, s) => sum + s.score, 0);
          if (totalScore === 0) {
            console.log(`  ZERO SCORE: Q"${q.questionText.slice(0, 30)}..." O"${o.optionText.slice(0, 30)}..." (OptID: ${o.id})`);
            missingOrZero++;
          }
        }
      });
    });

    if (missingOrZero === 0) {
      console.log(`  SUCCESS: All options for Test ${test.id} have positive scores.`);
    } else {
      console.log(`  WARNING: ${missingOrZero} issues found in Test ${test.id}.`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

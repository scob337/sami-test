import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const questions = await prisma.question.findMany({
      include: {
        options: {
          include: {
            scores: true
          }
        }
      }
    });

    console.log(`Total questions: ${questions.length}`);
    
    let missingScores = 0;
    questions.forEach(q => {
      q.options.forEach(o => {
        if (o.scores.length === 0) {
          console.log(`WARNING: Question ${q.id} ("${q.questionText}"), Option ${o.id} ("${o.optionText}") has NO score!`);
          missingScores++;
        } else {
          o.scores.forEach(s => {
            if (s.score === 0) {
              console.log(`INFO: Question ${q.id}, Option ${o.id} has a score of 0 for pattern ${s.pattern}`);
            }
          });
        }
      });
    });

    if (missingScores === 0) {
      console.log('SUCCESS: All processed options have at least one score.');
    } else {
      console.log(`TOTAL WARNINGS: ${missingScores} options missing scores.`);
    }
  } catch (err) {
    console.error('DATABASE ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

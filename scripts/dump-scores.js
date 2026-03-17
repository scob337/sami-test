const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const scores = await prisma.optionScore.findMany({
    take: 20,
    include: {
      option: {
        include: {
          question: true
        }
      }
    }
  });
  console.log(JSON.stringify(scores, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient, PatternType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ 
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

const questionsData = [
  {
    questionText: 'عندما تواجه مشكلة مفاجئة، ماذا تفعل غالبًا؟',
    options: [
      { text: 'أتصرف بسرعة وأحسم الأمر', scores: [{ pattern: PatternType.ASSERTIVE, score: 5 }] },
      { text: 'أفكر جيدًا قبل القرار', scores: [{ pattern: PatternType.THINKER, score: 5 }] },
      { text: 'أبحث عن رأي الآخرين', scores: [{ pattern: PatternType.OPEN, score: 5 }] },
      { text: 'أتجنب الدخول في المشكلة', scores: [{ pattern: PatternType.CALM, score: 5 }] },
    ]
  },
  {
    questionText: 'كيف تفضل قضاء وقت فراغك؟',
    options: [
      { text: 'في نشاطات حركية ومغامرات', scores: [{ pattern: PatternType.SPONTANEOUS, score: 5 }] },
      { text: 'في القراءة أو التفكير العميق', scores: [{ pattern: PatternType.WISE, score: 5 }] },
      { text: 'مع الأصدقاء والعائلة', scores: [{ pattern: PatternType.OPEN, score: 5 }] },
      { text: 'في تنظيم أموري الشخصية', scores: [{ pattern: PatternType.PRECISE, score: 5 }] },
    ]
  },
  {
    questionText: 'في النقاشات الجماعية، أنت غالباً:',
    options: [
      { text: 'أقود الحوار وأطرح رأيي بقوة', scores: [{ pattern: PatternType.ASSERTIVE, score: 5 }] },
      { text: 'أستمع جيداً وأحلل الآراء', scores: [{ pattern: PatternType.WISE, score: 5 }] },
      { text: 'أحاول تقريب وجهات النظر', scores: [{ pattern: PatternType.CALM, score: 5 }] },
      { text: 'أضيف لمسات مرحة وعفوية', scores: [{ pattern: PatternType.SPONTANEOUS, score: 5 }] },
    ]
  },
  {
    questionText: 'عند التخطيط لرحلة، ماذا تفعل؟',
    options: [
      { text: 'أضع جدولاً دقيقاً لكل ساعة', scores: [{ pattern: PatternType.PRECISE, score: 5 }] },
      { text: 'أحدد الخطوط العريضة فقط', scores: [{ pattern: PatternType.THINKER, score: 5 }] },
      { text: 'أترك الأمور للصدفة والمفاجآت', scores: [{ pattern: PatternType.SPONTANEOUS, score: 5 }] },
      { text: 'أهتم براحة الجميع وتوافقهم', scores: [{ pattern: PatternType.CALM, score: 5 }] },
    ]
  },
  {
    questionText: 'بماذا يصفك الآخرون غالباً؟',
    options: [
      { text: 'شخص حازم ومنجز', scores: [{ pattern: PatternType.ASSERTIVE, score: 5 }] },
      { text: 'شخص عميق وحكيم', scores: [{ pattern: PatternType.WISE, score: 5 }] },
      { text: 'شخص دقيق ومنظم', scores: [{ pattern: PatternType.PRECISE, score: 5 }] },
      { text: 'شخص اجتماعي ومنفتح', scores: [{ pattern: PatternType.OPEN, score: 5 }] },
    ]
  },
  {
    questionText: 'كيف تتعامل مع التغييرات المفاجئة؟',
    options: [
      { text: 'أتقبلها بمرونة وأتكيف بسرعة', scores: [{ pattern: PatternType.SPONTANEOUS, score: 5 }] },
      { text: 'أحلل أثرها عليّ أولاً', scores: [{ pattern: PatternType.THINKER, score: 5 }] },
      { text: 'أشعر ببعض القلق وأحتاج وقت للهدوء', scores: [{ pattern: PatternType.CALM, score: 5 }] },
      { text: 'أحاول السيطرة على الموقف وتوجيهه', scores: [{ pattern: PatternType.ASSERTIVE, score: 3 }] },
    ]
  },
  {
    questionText: 'ما هو شعارك في العمل؟',
    options: [
      { text: 'الإنجاز السريع هو الأهم', scores: [{ pattern: PatternType.ASSERTIVE, score: 5 }] },
      { text: 'الدقة في التفاصيل سر النجاح', scores: [{ pattern: PatternType.PRECISE, score: 5 }] },
      { text: 'الابتكار والتفكير خارج الصندوق', scores: [{ pattern: PatternType.THINKER, score: 5 }] },
      { text: 'العمل الجماعي بروح طيبة', scores: [{ pattern: PatternType.CALM, score: 5 }] },
    ]
  },
  {
    questionText: 'عند شراء شيء جديد، هل:',
    options: [
      { text: 'تقرأ كل المواصفات والمراجعات بدقة', scores: [{ pattern: PatternType.PRECISE, score: 5 }] },
      { text: 'تقرر بسرعة بناءً على حدسك', scores: [{ pattern: PatternType.SPONTANEOUS, score: 5 }] },
      { text: 'تقارن بينه وبين الخيارات الأخرى منطقياً', scores: [{ pattern: PatternType.THINKER, score: 5 }] },
      { text: 'تتأثر برأي المقربين أو المشاهير', scores: [{ pattern: PatternType.OPEN, score: 5 }] },
    ]
  },
  {
    questionText: 'في الأزمات، أنت الشخص الذي:',
    options: [
      { text: 'يتولى القيادة ويوزع المهام', scores: [{ pattern: PatternType.ASSERTIVE, score: 5 }] },
      { text: 'يهدئ الجميع ويمتص الغضب', scores: [{ pattern: PatternType.CALM, score: 5 }] },
      { text: 'يقدم حلولاً مبتكرة للخروج منها', scores: [{ pattern: PatternType.WISE, score: 5 }] },
      { text: 'يجمع كل المعلومات الممكنة للفهم', scores: [{ pattern: PatternType.THINKER, score: 5 }] },
    ]
  },
  {
    questionText: 'كيف تصف علاقتك بالوقت؟',
    options: [
      { text: 'أنا منضبط جداً وأكره التأخير', scores: [{ pattern: PatternType.PRECISE, score: 5 }] },
      { text: 'وقتي مرن وأقدر العفوية', scores: [{ pattern: PatternType.SPONTANEOUS, score: 5 }] },
      { text: 'أحاول استغلال كل لحظة في شيء مفيد', scores: [{ pattern: PatternType.WISE, score: 5 }] },
      { text: 'لا أهتم كثيراً بالساعة طالما أنا مرتاح', scores: [{ pattern: PatternType.CALM, score: 5 }] },
    ]
  },
  {
    questionText: 'ما الذي يجعلك تشعر بالإحباط أكثر؟',
    options: [
      { text: 'الفوضى وعدم النظام', scores: [{ pattern: PatternType.PRECISE, score: 5 }] },
      { text: 'القيود ومنع الحرية', scores: [{ pattern: PatternType.SPONTANEOUS, score: 5 }] },
      { text: 'الظلم أو عدم المنطقية', scores: [{ pattern: PatternType.THINKER, score: 5 }] },
      { text: 'الصراعات والمشاكل الشخصية', scores: [{ pattern: PatternType.CALM, score: 5 }] },
    ]
  },
  {
    questionText: 'في التعلم، تفضل:',
    options: [
      { text: 'التطبيق العملي المباشر', scores: [{ pattern: PatternType.ASSERTIVE, score: 5 }] },
      { text: 'البحث النظري والتعمق في الأسباب', scores: [{ pattern: PatternType.WISE, score: 5 }] },
      { text: 'التعلم من خلال التجارب والأخطاء', scores: [{ pattern: PatternType.SPONTANEOUS, score: 5 }] },
      { text: 'التعلم في بيئة منظمة ومهيأة', scores: [{ pattern: PatternType.PRECISE, score: 3 }] },
    ]
  },
  {
    questionText: 'عند التحدث مع شخص جديد، أنت:',
    options: [
      { text: 'منفتح جداً وأبدأ الحديث بسهولة', scores: [{ pattern: PatternType.OPEN, score: 5 }] },
      { text: 'هادئ وأنتظر الآخر ليبدأ', scores: [{ pattern: PatternType.CALM, score: 5 }] },
      { text: 'أركز على فهم شخصيته من كلامه', scores: [{ pattern: PatternType.THINKER, score: 5 }] },
      { text: 'أتحدث بوضوح وإيجاز عن نفسي', scores: [{ pattern: PatternType.ASSERTIVE, score: 3 }] },
    ]
  },
  {
    questionText: 'كيف تتخذ قراراتك الهامة؟',
    options: [
      { text: 'بناءً على الحقائق والأرقام فقط', scores: [{ pattern: PatternType.PRECISE, score: 5 }] },
      { text: 'بناءً على مشاعري وما يمليه عليّ قلبي', scores: [{ pattern: PatternType.CALM, score: 5 }] },
      { text: 'بناءً على استشارة الخبراء والحكماء', scores: [{ pattern: PatternType.WISE, score: 5 }] },
      { text: 'بناءً على الفرص المتاحة في اللحظة', scores: [{ pattern: PatternType.SPONTANEOUS, score: 5 }] },
    ]
  }
];

async function main() {
  console.log('Seeding database started...')
  
  // Clear existing data to avoid duplication if retrying
  await prisma.answer.deleteMany({});
  await prisma.attempt.deleteMany({});
  await prisma.optionScore.deleteMany({});
  await prisma.questionOption.deleteMany({});
  await prisma.question.deleteMany({});
  await (prisma as any).test.deleteMany({});
    await (prisma as any).book.deleteMany({});
  console.log('Cleared existing database tables.');

  try {
    // 1. Create or get default book and test
    const book = await (prisma as any).book.create({
      data: {
        title: 'كتاب الأنماط السبعة',
        filePdf: 'https://example.com/book.pdf',
      }
    });

    const test = await (prisma as any).test.create({
      data: {
        name: 'اختبار الأنماط السبعة الأساسي',
        bookId: book.id,
      }
    });

    for (let i = 0; i < questionsData.length; i++) {
      const q = questionsData[i];
      console.log(`Processing question ${i + 1}: ${q.questionText}`);
      const createdQuestion = await prisma.question.create({
        data: {
          testId: test.id,
          questionText: q.questionText,
          sortOrder: i + 1,
          isActive: true,
        }
      });

      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        const createdOption = await prisma.questionOption.create({
          data: {
            questionId: createdQuestion.id,
            optionText: opt.text,
            sortOrder: j + 1,
          }
        });

        for (const s of opt.scores) {
          await prisma.optionScore.create({
            data: {
              optionId: createdOption.id,
              pattern: s.pattern,
              score: s.score,
            }
          });
        }
      }
    }
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

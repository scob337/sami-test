import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const PATTERNS = [
  "ASSERTIVE",
  "PRECISE",
  "CALM",
  "WISE",
  "SPONTANEOUS",
  "OPEN",
  "THINKER",
] as const;

const DEFAULT_QUESTIONS: { q: string; opts: string[] }[] = [
  {
    q: "عندما تواجه مشكلة مفاجئة ماذا تفعل؟",
    opts: [
      "أتصرف بسرعة وأحسم القرار",
      "أراجع التفاصيل بدقة",
      "أهدأ وأنتظر",
      "أفكر في المعنى",
      "أتصرف بعفوية",
      "أتحدث مع الناس حولي",
      "أفكر طويلًا قبل القرار",
    ],
  },
  {
    q: "كيف تتعامل مع ضغط العمل؟",
    opts: [
      "أحدد الأولويات وأنجز بسرعة",
      "أرتب المهام وأتأكد من كل تفصيلة",
      "أحافظ على هدوئي وأتحرك بهدوء",
      "أحلل السبب وأتعلم منه",
      "أغير الجو وأتصرف بمرونة",
      "أطلب الدعم وأشارك الفريق",
      "أفكر في أفضل خطة قبل التنفيذ",
    ],
  },
  {
    q: "عند اتخاذ قرار مهم، ما الأقرب لطريقتك؟",
    opts: [
      "أقرر مباشرة بناءً على الهدف",
      "أجمع معلومات كافية ثم أقرر",
      "أؤجل قليلًا حتى أرتاح نفسيًا",
      "أربط القرار بالقيم والمعنى",
      "أجرب وأرى ما يحدث",
      "أستشير من حولي كثيرًا",
      "أحلل المخاطر والنتائج بدقة",
    ],
  },
  {
    q: "في النقاشات، كيف يكون أسلوبك؟",
    opts: [
      "مباشر وحازم",
      "دقيق ويهمني التوثيق",
      "هادئ ومتزن",
      "عميق ويركز على الحكمة",
      "خفيف وعفوي",
      "اجتماعي ويهمني التوافق",
      "تحليلي ويهمني المنطق",
    ],
  },
  {
    q: "ما الذي يحفّزك أكثر؟",
    opts: [
      "الإنجاز والنتائج",
      "الجودة والإتقان",
      "الاستقرار والراحة",
      "المعنى والتأثير",
      "التجربة والتغيير",
      "العلاقات والقبول",
      "الفهم والمعرفة",
    ],
  },
  {
    q: "عند حدوث خلاف مع شخص، ماذا تفعل؟",
    opts: [
      "أواجه المشكلة مباشرة",
      "أناقش بالأدلة والتفاصيل",
      "أحاول تهدئة الوضع أولًا",
      "أبحث عن الدروس والمعنى",
      "أتعامل بخفة وأتجاوز سريعًا",
      "أركز على الحفاظ على العلاقة",
      "أحلل أسباب الخلاف بعمق",
    ],
  },
  {
    q: "كيف تصف تنظيمك اليومي؟",
    opts: [
      "منظم بهدف الإنجاز",
      "منظم جدًا وبقائمة دقيقة",
      "مرن وهادئ",
      "أركز على الأهم وفق رؤية",
      "غير ثابت؛ حسب المزاج",
      "يعتمد على الناس واللقاءات",
      "أخطط كثيرًا قبل التنفيذ",
    ],
  },
  {
    q: "في التجارب الجديدة أنت عادةً…",
    opts: [
      "أقود وأبادر",
      "أبحث وأقرأ قبل التجربة",
      "أنتظر حتى أتأكد",
      "أفكر في قيمتها ومعناها",
      "أجرب فورًا",
      "أشارك الآخرين وأتحمس معهم",
      "أحلل النتائج وأقارن",
    ],
  },
  {
    q: "عند التعامل مع الأخطاء، ما رد فعلك؟",
    opts: [
      "أصلح بسرعة وأمضي",
      "أدقق لأعرف أين الخطأ",
      "أتجنب التوتر وأهدأ",
      "أستخلص حكمة من الخطأ",
      "أضحك وأتعلم بطريقة خفيفة",
      "أناقش مع الآخرين وأتعلم منهم",
      "أحلل الأسباب الجذرية",
    ],
  },
  {
    q: "أي وصف أقرب لك؟",
    opts: [
      "قوي وصريح",
      "ملتزم ودقيق",
      "لطيف وهادئ",
      "عميق وحكيم",
      "متحمس وعفوي",
      "اجتماعي ومنفتح",
      "مفكر وعملي بالتحليل",
    ],
  },
  {
    q: "كيف ترى النجاح؟",
    opts: [
      "تحقيق هدف واضح",
      "الوصول لأفضل جودة ممكنة",
      "حياة مستقرة ومتوازنة",
      "أثر ومعنى يستمر",
      "تجارب ممتعة ومتنوعة",
      "علاقات قوية ودعم متبادل",
      "فهم عميق وإتقان معرفي",
    ],
  },
  {
    q: "كيف تتعامل مع الوقت؟",
    opts: [
      "أستغله لتحقيق نتائج",
      "أرتب وأخطط بدقة",
      "أحافظ على وتيرة هادئة",
      "أستخدمه فيما له قيمة",
      "أترك مساحة للصدفة",
      "أخصص وقتًا للناس",
      "أحلله وأبحث أفضل طريقة",
    ],
  },
  {
    q: "عند العمل ضمن فريق، أنت غالبًا…",
    opts: [
      "قائد وموجه",
      "مدقق للجودة",
      "داعِم للهدوء",
      "صاحب رؤية وحكمة",
      "محفّز بالأفكار السريعة",
      "واصل اجتماعي ممتاز",
      "محلل ومخطط",
    ],
  },
];

async function main() {
  console.log("Start seeding...");
  
  // Clear existing
  await prisma.report.deleteMany();
  await prisma.result.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.optionScore.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.aiPrompt.deleteMany();
  await prisma.test.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Default Book
  const book = await prisma.book.create({
    data: {
      title: "اعرف نمطك",
      filePdf: "https://example.com/book1.pdf",
    }
  });

  // 2. Create Default Test
  const test = await prisma.test.create({
    data: {
      name: "اختبار الأنماط السبعة",
      bookId: book.id,
    }
  });

  // 3. Create AI Prompt for the test
  await prisma.aiPrompt.create({
    data: {
      testId: test.id,
      systemPrompt: "أنت خبير في تحليل الشخصية بناءً على الأنماط السبعة. مهمتك هي تقديم تقرير مفصل ودقيق للمستخدم بناءً على إجاباته.",
      reportRules: "1. ابدأ بترحيب حار ووصف عام للنمط الأساسي.\n2. اشرح كيف يتفاعل النمط الأساسي مع النمط الثانوي.\n3. حدد 3 نقاط قوة رئيسية و 3 مجالات للتطوير.",
    }
  });

  // 4. Create Questions for the test
  for (let i = 0; i < DEFAULT_QUESTIONS.length; i++) {
    const qData = DEFAULT_QUESTIONS[i];
    const question = await prisma.question.create({
      data: {
        testId: test.id,
        questionText: qData.q,
        sortOrder: i + 1,
        isActive: true,
      },
    });

    for (let oi = 0; oi < qData.opts.length; oi++) {
      const optText = qData.opts[oi];
      const option = await prisma.questionOption.create({
        data: {
          questionId: question.id,
          optionText: optText,
          sortOrder: oi + 1,
        },
      });

      const pattern = PATTERNS[oi % PATTERNS.length];
      await prisma.optionScore.create({
        data: {
          optionId: option.id,
          pattern: pattern as any,
          score: 2,
        },
      });
    }
  }

  // 5. Create a default Admin user
  await prisma.user.create({
    data: {
      name: "المدير",
      email: "admin@example.com",
      isAdmin: true,
      verifiedAt: new Date(),
    }
  });
  
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

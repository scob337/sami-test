# Sami-Test - منصة اختبارات الشخصية الذكية

منصة متقدمة لاختبارات الشخصية مدعومة بالذكاء الاصطناعي، توفر تقارير شاملة وتوصيات مخصصة.

## المميزات

- **اختبار ذكي**: 14 سؤال متخصص مع تحليل متقدم
- **تقارير شاملة**: تقارير مفصلة عن نوع الشخصية والقدرات
- **مكتبة موارد**: كتب وموارد مخصصة لكل نوع شخصية
- **دعم الدفع**: تكامل Stripe للعضويات المميزة
- **OTP via SMS**: التحقق الآمن برسائل نصية عبر Twilio
- **لوحة تحكم**: لإدارة النتائج والإعدادات
- **تصميم عصري**: واجهة مستخدم جميلة بـ Framer Motion animations
- **متجاوب**: دعم كامل للهواتف والأجهزة اللوحية

## التكنولوجيا المستخدمة

### Frontend
- **Next.js 16**: إطار عمل React الحديث
- **TypeScript**: للكود أكثر أماناً وموثوقية
- **Tailwind CSS 4**: نظام تنسيق قوي
- **Framer Motion**: رسوم متحركة سلسة واحترافية
- **SWR**: جلب البيانات والتخزين المؤقت

### Backend & Database
- **Supabase**: قاعدة بيانات PostgreSQL مع Authentication
- **Row Level Security (RLS)**: أمان البيانات على مستوى الصفوف
- **Vercel Blob**: تخزين الملفات (PDFs)

### Integrations
- **Stripe**: معالجة الدفع آمن
- **Twilio**: إرسال OTP عبر SMS
- **OpenAI**: تحليل البيانات (إذا كان مفعل)
- **n8n**: أتمتة العمليات

### State Management & Validation
- **Zustand**: إدارة الحالة خفيفة وفعالة
- **React Hook Form**: إدارة النماذج
- **Zod**: التحقق من البيانات بشكل آمن

## البنية

```
project/
├── app/                      # Next.js App Router
│   ├── (public)/            # صفحات عامة
│   │   ├── page.tsx        # الرئيسية
│   │   ├── privacy/        # سياسة الخصوصية
│   │   └── terms/          # الشروط والأحكام
│   ├── auth/               # صفحات الدخول والتسجيل
│   │   ├── login/
│   │   ├── register/
│   │   └── otp/
│   ├── test/               # صفحات الاختبار
│   ├── results/            # عرض النتائج
│   ├── checkout/           # الدفع
│   ├── dashboard/          # لوحة المستخدم
│   ├── books/              # المكتبة
│   ├── settings/           # الإعدادات
│   ├── api/                # API Routes
│   │   ├── auth/
│   │   └── test/
│   └── layout.tsx          # Root layout
├── components/             # مكونات React
│   ├── layout/            # مكونات التخطيط
│   ├── auth/              # مكونات المصادقة
│   ├── test/              # مكونات الاختبار
│   ├── home/              # مكونات الرئيسية
│   └── ui/                # مكونات واجهة المستخدم
├── lib/                    # وظائف وأدوات
│   ├── supabase/          # عملاء Supabase
│   ├── store/             # Zustand stores
│   ├── validations/       # Zod schemas
│   ├── animations.ts      # Framer Motion presets
│   ├── config.ts          # إعدادات المشروع
│   └── utils.ts           # وظائف مساعدة
├── types/                  # TypeScript types
│   └── supabase.ts        # Database types
├── scripts/               # Database migrations
└── public/                # الملفات الثابتة
```

## البدء السريع

### المتطلبات
- Node.js 18+
- pnpm (أو npm/yarn)
- حساب Supabase
- مفاتيح API للخدمات الخارجية

### التثبيت

1. استنساخ المستودع:
```bash
git clone <repository-url>
cd Sami-Test
```

2. تثبيت المكتبات:
```bash
pnpm install
```

3. إعداد المتغيرات البيئية:
```bash
cp .env.local.example .env.local
```

4. ملء قيم المتغيرات البيئية في `.env.local`

5. تشغيل المشروع:
```bash
pnpm dev
```

6. افتح `http://localhost:3000` في المتصفح

## إعداد قاعدة البيانات

قم بتنفيذ ملف migration:

```bash
# استخدم Supabase CLI أو SQL Editor مباشرة
psql -h your-supabase-url -U postgres < scripts/setup_db.sql
```

## متغيرات البيئة المطلوبة

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# OpenAI
OPENAI_API_KEY=

# n8n
N8N_WEBHOOK_URL=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## الميزات المستقبلية

- [ ] دعم اللغات المتعددة (إنجليزي)
- [ ] لوحة تحكم Admin متقدمة
- [ ] تقارير PDF قابلة للتحميل
- [ ] مشاركة النتائج عبر وسائل التواصل
- [ ] اختبارات الدقة المتقدمة
- [ ] تحليل OpenAI المتقدم
- [ ] نسخ احتياطية تلقائية
- [ ] Analytics شامل

## دليل التطوير

### إضافة ميزة جديدة

1. أنشئ فرع جديد:
```bash
git checkout -b feature/feature-name
```

2. اتبع البنية الحالية والأنماط
3. اختبر التغييرات محلياً
4. أرسل pull request

### معايير الكود

- استخدم TypeScript في كل مكان
- اتبع نمط Functional Components
- استخدم hooks بدل class components
- أضف Zod validation للبيانات الخارجية
- كتب الاختبارات للـ utils المهمة

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## التواصل والدعم

للمشاكل والاقتراحات:
- البريد الإلكتروني: support@Sami-Test.app
- الهاتف: +966 55 000 0000

---

صُنع بـ ❤️ باستخدام Next.js و TypeScript

# Sami-Test

منصة اختبارات شخصية مبنية على `Next.js` مع باك إند يعتمد على `PostgreSQL` بشكل مباشر عبر `pg` (node-postgres) مع `JWT` للمصادقة.

## نظرة سريعة

- الباك إند يعمل على PostgreSQL عبر طبقتين:
- `Prisma` موجود للتعامل مع أجزاء من النظام.
- `pg` مفعّل لطبقة SQL المباشرة (خصوصًا مسارات المصادقة والترحيل).
- المصادقة قائمة على `JWT` محفوظ في `HttpOnly cookie` باسم `token`.
- رفع الملفات يتم محليًا في `public/uploads/*` عبر API داخلي.

## البنية

```text
app/
  api/
    auth/           # login/register/me/logout/forgot/reset
lib/
  db/
    pool.ts         # PostgreSQL connection pooling
    auth-repository.ts # SQL queries for auth flows
  auth.ts           # password + cookie helpers
  jwt.ts            # sign/verify session token
scripts/
  migrate-supabase-to-postgres.mjs # نقل البيانات من مصدر Supabase إلى PostgreSQL
  setup-buckets.mjs # تجهيز مجلدات الرفع المحلية
tests/
  unit/
  integration/
```

## التشغيل المحلي

1. تثبيت الحزم:

```bash
pnpm install
```

2. إنشاء ملف البيئة:

```bash
cp .env.example .env
```

3. تنفيذ migrations:

```bash
pnpm prisma migrate deploy
```

4. تشغيل التطبيق:

```bash
pnpm dev
```

## متغيرات البيئة

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
DIRECT_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=replace-with-strong-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional for data migration source
SUPABASE_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres
MIGRATION_TRUNCATE=false
```

## ترحيل البيانات من Supabase

- جهز قاعدة PostgreSQL الهدف بنفس schema.
- عيّن:
- `SUPABASE_DATABASE_URL` لمصدر البيانات.
- `DATABASE_URL` لقاعدة الهدف.
- نفّذ:

```bash
pnpm db:migrate:data
```

> إذا أردت إعادة تعبئة الجداول من الصفر، فعّل `MIGRATION_TRUNCATE=true`.

## المصادقة

- تسجيل الدخول والتسجيل يعملان عبر SQL مباشر على جدول `User`.
- الجلسة تُدار بواسطة JWT داخل Cookie آمنة.
- التحقق من الجلسة يتم من `lib/jwt.ts` و `lib/auth.ts`.

## إدارة الملفات

- API الرفع: `POST /api/user/upload`
- التخزين: `public/uploads/<bucket>/...`
- تجهيز مجلدات الرفع:

```bash
pnpm storage:prepare
```

## الاختبارات

```bash
pnpm test:unit
pnpm test:integration
pnpm test
```

ملاحظة: اختبارات التكامل تحتاج قاعدة بيانات متاحة عبر `TEST_DATABASE_URL` أو `DATABASE_URL`.

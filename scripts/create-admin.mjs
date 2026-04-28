import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config()

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is missing in environment variables.')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1337@'
  const adminName = process.env.ADMIN_NAME || 'مدير النظام'
  const adminPhone = process.env.ADMIN_PHONE || '00000000'

  console.log(`🚀 البدء في إنشاء حساب أدمن: ${adminEmail}...`)

  try {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        isAdmin: true,
        name: adminName,
        phone: adminPhone,
        password: hashedPassword,
      },
      create: {
        email: adminEmail,
        name: adminName,
        phone: adminPhone,
        password: hashedPassword,
        isAdmin: true,
      },
    })

    console.log('✅ تم إنشاء/تحديث حساب الأدمن بنجاح:')
    console.log(`- الاسم: ${admin.name}`)
    console.log(`- البريد: ${admin.email}`)
    console.log(`- الصلاحية: ${admin.isAdmin ? 'مدير (Admin)' : 'مستخدم عادي'}`)
    console.log(`- كلمة المرور: ${adminPassword}`)
  } catch (error) {
    console.error('❌ حدث خطأ أثناء إنشاء الحساب:', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()

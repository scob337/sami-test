import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import * as dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = 'Samialmoamer@gmail.com'
  const adminPassword ='Scob1337@'
  const adminName = 'مدير النظام'
  const adminPhone =  '01255'

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
    console.log('\n💡 يمكنك الآن تسجيل الدخول بهذا البريد في لوحة التحكم.')
  } catch (error) {
    console.error('❌ حدث خطأ أثناء إنشاء الحساب:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()

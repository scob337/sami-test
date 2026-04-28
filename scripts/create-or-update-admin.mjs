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
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = process.env.ADMIN_NAME
  const adminPhone = process.env.ADMIN_PHONE

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in env.')
    process.exit(1)
  }

  console.log(`🚀 إنشاء/تحديث حساب الأدمن: ${adminEmail} (يفحص البريد أو الهاتف)`)

  try {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // حاول إيجاد مستخدم بنفس البريد أو الهاتف
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: adminEmail },
          ...(adminPhone ? [{ phone: adminPhone }] : []),
        ],
      },
    })

    let user
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          email: adminEmail,
          name: adminName,
          phone: adminPhone,
          password: hashedPassword,
          isAdmin: true,
        },
      })
      console.log('✅ تم تحديث الحساب الموجود:')
    } else {
      user = await prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          phone: adminPhone,
          password: hashedPassword,
          isAdmin: true,
        },
      })
      console.log('✅ تم إنشاء حساب الأدمن بنجاح:')
    }

    console.log(`- الاسم: ${user.name}`)
    console.log(`- البريد: ${user.email}`)
    console.log(`- الهاتف: ${user.phone}`)
    console.log(`- صلاحية: ${user.isAdmin ? 'مدير (Admin)' : 'مستخدم'}`)
  } catch (error) {
    console.error('❌ حدث خطأ:', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()

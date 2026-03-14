import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import * as dotenv from 'dotenv'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = 'admin@admin.com'
  const adminName = 'مدير النظام'
  const adminPhone = '00000000'

  console.log(`🚀 البدء في إنشاء حساب أدمن: ${adminEmail}...`)

  try {
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        isAdmin: true,
        name: adminName,
        phone: adminPhone,
      },
      create: {
        email: adminEmail,
        name: adminName,
        phone: adminPhone,
        isAdmin: true,
      },
    })

    // Optionally create/confirm Supabase auth user if service role key is available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceRoleKey) {
      try {
        const adminClient = createSupabaseAdmin(supabaseUrl, serviceRoleKey)
        const adminPassword = process.env.ADMIN_PASSWORD || `Admin@${Math.random().toString(36).slice(2,10)}`

        // Create user via admin API and confirm email
        const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: { fullName: adminName, phone: adminPhone },
        })

        if (createErr) {
          console.error('Supabase admin create user error:', createErr)
        } else {
          console.log('✅ Supabase auth user created/confirmed for admin.')
          console.log(`- admin password: ${adminPassword}`)
        }
      } catch (err) {
        console.error('Error creating supabase admin user:', err)
      }
    } else {
      console.log('ℹ️ SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL not set — skipped Supabase user creation.')
    }

    console.log('✅ تم إنشاء/تحديث حساب الأدمن بنجاح:')
    console.log(`- الاسم: ${admin.name}`)
    console.log(`- البريد: ${admin.email}`)
    console.log(`- الصلاحية: ${admin.isAdmin ? 'مدير (Admin)' : 'مستخدم عادي'}`)
    console.log('\n💡 يمكنك الآن تسجيل الدخول بهذا البريد في لوحة التحكم.')
  } catch (error) {
    console.error('❌ حدث خطأ أثناء إنشاء الحساب:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()

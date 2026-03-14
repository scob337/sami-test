import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { registerSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Initialize Supabase
    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 409 }
      )
    }

    // If a service role key is available, create the user as confirmed via admin API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tfurofrwzwbdkivtkbee.supabase.co'
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (serviceRoleKey) {
      const admin = createSupabaseAdmin(supabaseUrl, serviceRoleKey)

      const { data: adminUser, error: adminError } = await admin.auth.admin.createUser({
        email: validatedData.email,
        password: validatedData.password,
        email_confirm: true,
        user_metadata: {
          fullName: validatedData.fullName,
          phone: validatedData.phone,
        },
      })

      if (adminError) {
        console.error('Admin create user error:', adminError)
        return NextResponse.json({ error: adminError.message }, { status: 400 })
      }

      // Sign in the new user to create a session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      })

      if (signInError) {
        console.error('Sign-in after admin create failed:', signInError)
        return NextResponse.json({ message: 'تم إنشاء الحساب بنجاح', userId: adminUser.user?.id }, { status: 201 })
      }

      return NextResponse.json(
        {
          message: 'تم التسجيل وتفعيل الحساب بنجاح',
          user: signInData.user,
          session: signInData.session,
        },
        { status: 201 }
      )
    }

    // Sign up with Supabase Auth (fallback to default flow)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          fullName: validatedData.fullName,
          phone: validatedData.phone,
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        message: 'تم التسجيل بنجاح. يرجى التحقق من رقم الهاتف',
        user: authData.user,
        session: authData.session,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    )
  }
}

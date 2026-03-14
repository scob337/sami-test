import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .order('order', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: 'فشل تحميل الأسئلة' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { questions },
      { status: 200 }
    )
  } catch (error) {
    console.error('Questions fetch error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل الأسئلة' },
      { status: 500 }
    )
  }
}

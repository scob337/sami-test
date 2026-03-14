import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // This will clear the auth cookies set by the server client
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Supabase signOut error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Logged out' }, { status: 200 })
  } catch (err) {
    console.error('Logout route error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

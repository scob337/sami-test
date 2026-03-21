import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const results = []

  try {
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Admin_Insert_Videos" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'videos');
    `)
    results.push('Videos policy created')
  } catch (e: any) {
    results.push('Videos policy error: ' + e.message)
  }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Admin_Insert_Thumbnails" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'thumbnails');
    `)
    results.push('Thumbnails policy created')
  } catch (e: any) {
    results.push('Thumbnails policy error: ' + e.message)
  }

  // Same for avatars just in case
  try {
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Admin_Insert_Avatars" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'avatars');
    `)
    results.push('Avatars policy created')
  } catch (e: any) {
    results.push('Avatars policy error: ' + e.message)
  }

  return NextResponse.json({ results })
}

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const buckets = ['videos', 'thumbnails', 'avatars', 'books', 'general', 'reports', 'pdfs']

  for (const bucket of buckets) {
    try {
      console.log(`Creating full access policy for ${bucket}...`)
      
      // Drop existing if any, ignoring errors if they don't exist
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Admin_Insert_${bucket}" ON storage.objects;`).catch(() => {})
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "${bucket}_All" ON storage.objects;`).catch(() => {})
      
      await prisma.$executeRawUnsafe(`
        CREATE POLICY "${bucket}_All" ON storage.objects 
        FOR ALL 
        TO public 
        USING (bucket_id = '${bucket}') 
        WITH CHECK (bucket_id = '${bucket}');
      `)
      console.log(`${bucket} policy created successfully`)
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        console.log(`${bucket} policy already exists`)
      } else {
        console.error(`Error on ${bucket}:`, e)
      }
    }
  }
}

main().finally(() => prisma.$disconnect())

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Creating policy for videos...')
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Admin_Insert_Videos" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'videos');
    `)
    console.log('Videos policy created')
  } catch (e: any) {
    if (e.message.includes('already exists')) {
      console.log('Videos policy already exists')
    } else {
      console.error(e)
    }
  }

  try {
    console.log('Creating policy for thumbnails...')
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Admin_Insert_Thumbnails" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'thumbnails');
    `)
    console.log('Thumbnails policy created')
  } catch (e: any) {
    if (e.message.includes('already exists')) {
      console.log('Thumbnails policy already exists')
    } else {
      console.error(e)
    }
  }
}
main()

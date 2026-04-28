import dotenv from 'dotenv'
import path from 'path'
import { mkdir } from 'fs/promises'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

async function ensureUploadDirectories() {
  const buckets = ['avatars', 'books', 'videos', 'thumbnails', 'general']

  for (const bucketName of buckets) {
    const dir = path.resolve(process.cwd(), 'public', 'uploads', bucketName)
    await mkdir(dir, { recursive: true })
    console.log(`Ready: ${dir}`)
  }
}

ensureUploadDirectories().catch((error) => {
  console.error('Failed to prepare upload directories:', error)
  process.exit(1)
})

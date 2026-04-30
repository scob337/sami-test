import { NextResponse } from 'next/server'
import { mkdir } from 'fs/promises'
import { join } from 'path'
import { createWriteStream } from 'fs'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || 'avatars'

    // Verify file exists and is a valid upload
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    // Define the upload path
    const uploadDir = join(process.cwd(), 'public', 'uploads', bucket)
    const filePath = join(uploadDir, fileName)

    // Ensure the directory exists
    await mkdir(uploadDir, { recursive: true })

    // Write the file using streams for memory efficiency
    // pipeline handles cleanup and error propagation automatically
    await pipeline(
      Readable.fromWeb(file.stream() as any),
      createWriteStream(filePath)
    )

    // Return the public URL
    const publicUrl = `/uploads/${bucket}/${fileName}`
    
    return NextResponse.json({ url: publicUrl })

  } catch (error: any) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || 'avatars'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    // Define the upload path
    const uploadDir = join(process.cwd(), 'public', 'uploads', bucket)
    const filePath = join(uploadDir, fileName)

    // Ensure the directory exists
    await mkdir(uploadDir, { recursive: true })

    // Write the file
    await writeFile(filePath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/${bucket}/${fileName}`
    
    return NextResponse.json({ url: publicUrl })

  } catch (error: any) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

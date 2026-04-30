import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParts } = await params
    const filePath = join(process.cwd(), 'public', 'uploads', ...pathParts)

    // Check if file exists
    if (!existsSync(filePath)) {
      return new NextResponse('File Not Found', { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(filePath)

    // Determine content type based on extension
    const ext = filePath.split('.').pop()?.toLowerCase()
    const contentTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'pdf': 'application/pdf',
      'svg': 'image/svg+xml'
    }

    const contentType = contentTypeMap[ext || ''] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('[UPLOADS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

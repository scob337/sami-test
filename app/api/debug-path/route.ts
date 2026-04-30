import { NextResponse } from 'next/server'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET() {
  const cwd = process.cwd()
  const publicPath = join(cwd, 'public')
  const uploadsPath = join(publicPath, 'uploads')
  
  return NextResponse.json({
    cwd,
    publicPath,
    publicExists: existsSync(publicPath),
    uploadsPath,
    uploadsExists: existsSync(uploadsPath)
  })
}

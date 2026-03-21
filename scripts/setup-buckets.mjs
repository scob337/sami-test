import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createBuckets() {
  const buckets = ['thumbnails', 'videos', 'books']
  
  for (const bucketName of buckets) {
    console.log(`Checking bucket: ${bucketName}...`)
    const { data: bucket, error: getError } = await supabase.storage.getBucket(bucketName)
    
    if (getError) {
      console.log(`Bucket ${bucketName} does not exist or error getting it. Creating...`)
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: bucketName === 'videos' ? ['video/*'] : bucketName === 'thumbnails' ? ['image/*'] : undefined
      })
      
      if (createError) {
        console.error(`Failed to create bucket ${bucketName}:`, createError.message)
      } else {
        console.log(`Bucket ${bucketName} created successfully.`)
      }
    } else {
      console.log(`Bucket ${bucketName} already exists.`)
    }
  }
}

createBuckets()

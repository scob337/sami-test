const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    const { data: buckets } = await supabase.storage.listBuckets()
    const requiredBuckets = ['videos', 'thumbnails', 'avatars', 'books', 'general', 'reports', 'pdfs']
    
    for (const bucket of requiredBuckets) {
        if (!buckets?.find(b => b.name === bucket)) {
            console.log(`Creating bucket: ${bucket}`)
            const { error: createError } = await supabase.storage.createBucket(bucket, {
                public: true
            })
            if (createError) {
                console.error(`Failed to create bucket ${bucket}:`, createError)
            } else {
                console.log(`Successfully created bucket ${bucket}`)
            }
        }
    }
}

main()

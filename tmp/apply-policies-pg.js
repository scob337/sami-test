const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const dbUrlMatch = envContent.match(/DATABASE_URL=(?:'([^']+)'|"([^"]+)"|([^\s]+))/)
let dbUrl = ''
if (dbUrlMatch) {
  dbUrl = dbUrlMatch[1] || dbUrlMatch[2] || dbUrlMatch[3]
}

if (!dbUrl) {
  console.error('Could not find DATABASE_URL in .env.local')
  process.exit(1)
}

const client = new Client({ connectionString: dbUrl })

async function main() {
  await client.connect()
  const buckets = ['videos', 'thumbnails', 'avatars', 'books', 'general', 'reports', 'pdfs']

  for (const bucket of buckets) {
    try {
      console.log(`Creating full access policy for ${bucket}...`)
      await client.query(`DROP POLICY IF EXISTS "Admin_Insert_${bucket}" ON storage.objects;`)
      await client.query(`DROP POLICY IF EXISTS "${bucket}_All" ON storage.objects;`)
      await client.query(`
        CREATE POLICY "${bucket}_All" ON storage.objects 
        FOR ALL 
        TO public 
        USING (bucket_id = '${bucket}') 
        WITH CHECK (bucket_id = '${bucket}');
      `)
      console.log(`${bucket} policy created successfully`)
    } catch (e) {
      console.error(`Error on ${bucket}:`, e.message)
    }
  }
}

main().finally(() => client.end())

const axios = require('axios')
require('dotenv').config({ path: '.env.local' })

async function testUpload() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const bucket = 'videos'
  const path = `test-${Date.now()}.mp4`
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`

  // Dummy binary content
  const content = Buffer.from('dummy video data')

  try {
    const res = await axios.post(uploadUrl, content, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'video/mp4',
        'x-upsert': 'true'
      }
    })
    console.log('Upload success:', res.data)
  } catch (err) {
    console.error('Upload failed:')
    if (err.response) {
      console.error(err.response.status, err.response.data)
    } else {
      console.error(err.message)
    }
  }
}

testUpload()

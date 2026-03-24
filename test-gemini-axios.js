const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function probe() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const versions = ['v1', 'v1beta'];
  const models = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.0-pro'];
  
  for (const v of versions) {
    for (const m of models) {
      try {
        console.log(`Probing ${v}/${m}...`);
        const url = `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${apiKey}`;
        const res = await axios.post(url, {
          contents: [{ parts: [{ text: "hi" }] }]
        });
        console.log(`[SUCCESS] ${v}/${m}`);
        process.exit(0);
      } catch (e) {
        console.log(`[FAIL] ${v}/${m}: ${e.response?.status} ${e.response?.data?.error?.message || e.message}`);
      }
    }
  }
}
probe();

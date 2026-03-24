const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await axios.get(url);
    console.log('Available Models:', JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.log(`[FAIL] ListModels: ${e.response?.status} ${JSON.stringify(e.response?.data?.error || e.message)}`);
  }
}
listModels();

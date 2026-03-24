const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

async function listAll() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // In newer versions, we might need to use the REST API or 
    // a different method to list models, but we can try common ones again 
    // or check if there's a specific naming convention in this environment.
    console.log('API Key:', apiKey.substring(0, 10) + '...');
    
    // Let's try gemini-1.5-flash-latest which is common
    const models = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-pro', 'gemini-1.5-flash'];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const res = await model.generateContent("hi");
        console.log(`[OK] ${m}`);
        return;
      } catch (e) {
        console.log(`[FAIL] ${m}: ${e.message}`);
      }
    }
  } catch (err) {
    console.error('ListAll global error:', err);
  }
}
listAll();

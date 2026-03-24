const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      await model.generateContent("hello");
      console.log(`[SUCCESS] ${m}`);
    } catch (e) {
      console.log(`[FAILED] ${m}: ${e.message}`);
    }
  }
}
listModels();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
// Try to load .env from parent dir or same dir
dotenv.config();

async function testGemini() {
  try {
    const apiKey = "AIzaSyCyyNMN7MfpzTMZktK_ViQLtUaxzl-A2T8"; // Hardcoded for this test only
    if (!apiKey) {
      console.error('GOOGLE_AI_API_KEY not found');
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = "أنت خبير في تحليل الشخصية. اكتب فقرة قصيرة جداً (أقل من 20 كلمة) ترحب فيها بالمستخدم وتصفه بأنه طموح.";
    
    console.log('Testing Gemini with prompt:', prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Gemini Response:', text);
  } catch (error) {
    console.error('Gemini Test Error:', error.message);
  }
}

testGemini();

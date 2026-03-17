const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
  try {
    const apiKey = "AIzaSyCyyNMN7MfpzTMZktK_ViQLtUaxzl-A2T8";
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // There isn't a simple listModels in the main genAI object usually in this way
    // but we can try a simple query with gemini-1.5-flash-latest or gemini-pro
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Hi");
    console.log("Success with gemini-1.5-flash");
  } catch (error) {
    console.error('Error:', error.message);
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent("Hi");
        console.log("Success with gemini-pro");
    } catch (e2) {
        console.error('Error with gemini-pro:', e2.message);
    }
  }
}

listModels();

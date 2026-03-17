const { GoogleGenerativeAI } = require('@google/generative-ai');
const apiKey = "AIzaSyCyyNMN7MfpzTMZktK_ViQLtUaxzl-A2T8";
const genAI = new GoogleGenerativeAI(apiKey);

async function check() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("test");
    console.log("gemini-pro OK");
  } catch (e) {
    console.log("gemini-pro FAIL:", e.message);
  }
}

check();

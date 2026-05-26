const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkGemini() {
  try {
    const genAI = new GoogleGenerativeAI('AIzaSyB_hxf2HkFfxcxTj248ZYkeGPl93AxHwN4');
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const result = await model.generateContent('Say exactly: "Gemini works"');
    console.log("✅ GEMINI API: Success -", result.response.text().trim());
  } catch (error) {
    console.log("❌ GEMINI API: Failed -", error.message);
  }
}

checkGemini();

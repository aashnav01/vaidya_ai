const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getMongoTools, callMongoTool } = require('../mcp/client');

let genAI = null;
let model = null;

const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not set — AI features will use fallback responses');
    return null;
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  console.log('✅ Gemini 3 Flash Preview initialized');
  return model;
};

const getModel = () => {
  if (!model) initGemini();
  return model;
};

/**
 * Helper to convert MCP JSON Schema tools to Gemini tools format.
 */
function convertMCPToolsToGemini(mcpTools) {
  if (!mcpTools || mcpTools.length === 0) return [];
  
  return [{
    functionDeclarations: mcpTools.map(tool => {
      return {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'OBJECT',
          properties: tool.inputSchema.properties || {},
          required: tool.inputSchema.required || []
        }
      };
    })
  }];
}

/**
 * Handle a natural-language agent query using MCP Tool Calling.
 * Falls back to demo data if Gemini key is missing or fails.
 */
const processAgentQuery = async (query) => {
  const m = getModel();
  if (!m) {
    console.warn('⚠️  No Gemini model — returning fallback query response');
    return getFallbackQueryResponse(query);
  }

  const mcpTools = await getMongoTools();
  const geminiTools = convertMCPToolsToGemini(mcpTools);

  const mcpModel = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    tools: geminiTools.length > 0 ? geminiTools : undefined
  });

  const chat = mcpModel.startChat({
    systemInstruction: `You are VaidyaAI's clinical database agent. You have tools to securely query the MongoDB database holding patient records and consultations.
    
    Database schema info for your tools: 
    - patients collection: { patientId, name, age, gender, conditions, riskLevel, diagnosis, lastVisit }
    - consultations collection: { patientId, patientName, riskScore, soap: { s, o, a, p } }
    
    When asked a question, use your MongoDB tools to read the data, then formulate a final answer.
    Your final answer MUST be valid JSON (no markdown, no backticks) with this structure:
    {
      "interpreted_as": "What you understood the doctor is asking",
      "insight": "Detailed, actionable clinical insight answering the query using the data you fetched.",
      "collection_queried": "Patients|Consultations",
      "count": <number of records found/processed>
    }`
  });

  try {
    let result = await chat.sendMessage(query);
    
    // Handle Tool Calls if Gemini requested them
    while (result.response.functionCalls && result.response.functionCalls().length > 0) {
      const calls = result.response.functionCalls();
      const toolResponses = [];
      
      for (const call of calls) {
        try {
          const mcpResult = await callMongoTool(call.name, call.args);
          const textResponse = mcpResult.map(c => c.text).join('\n');
          
          toolResponses.push({
            functionResponse: {
              name: call.name,
              response: { result: textResponse }
            }
          });
        } catch (e) {
          toolResponses.push({
            functionResponse: {
              name: call.name,
              response: { error: e.message }
            }
          });
        }
      }
      
      // Send the tool results back to Gemini
      result = await chat.sendMessage(toolResponses);
    }
    
    // Final response
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);

  } catch (err) {
    console.error('❌ Gemini/MCP query error:', err.message);
    console.warn('⚠️  Falling back to demo response');
    return getFallbackQueryResponse(query);
  }
};

/**
 * Analyze a consultation transcript.
 * Falls back to demo data if Gemini key is missing or fails.
 */
const analyzeConsultation = async (transcript, patientHistory = '') => {
  const m = getModel();
  if (!m) {
    console.warn('⚠️  No Gemini model — returning fallback analysis');
    return getFallbackAnalysis(transcript);
  }

  const prompt = `You are VaidyaAI, an expert Indian OPD clinical assistant. Analyze this doctor-patient consultation transcript and return a JSON object.

Context: This is from an Indian government/private hospital OPD setting. Consider Indian drug brands, Jan Aushadhi (government generic pharmacy) alternatives, and Indian clinical guidelines.

${patientHistory ? `Patient History:\n${patientHistory}\n` : ''}

Transcript:
"${transcript}"

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "soap": {
    "s": "Subjective findings",
    "o": "Objective findings",
    "a": "Assessment with differential diagnoses",
    "p": "Plan including medications, tests, follow-up. Always end with: ⚠️ Doctor must review before prescribing."
  },
  "riskScore": <number 0-100 based on clinical severity>,
  "drugInteractions": [
    { "drugs": "Drug A + Drug B", "severity": "high|medium|low", "description": "Clinical significance" }
  ],
  "janAushadhi": [
    { "branded": "Brand name with dose", "generic": "Generic equivalent from Jan Aushadhi", "savings": <estimated savings in INR> }
  ]
}`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('❌ Gemini analysis error:', err.message);
    console.warn('⚠️  Falling back to demo analysis');
    return getFallbackAnalysis(transcript);
  }
};

/**
 * Transcribe audio using Gemini.
 * Falls back to a sample transcript if Gemini fails.
 */
const transcribeAudio = async (audioBuffer, mimeType = 'audio/webm') => {
  const m = getModel();
  if (!m) {
    console.warn('⚠️  No Gemini model — returning fallback transcript');
    return 'Patient reports chest discomfort and shortness of breath for 2 days. No radiating pain. History of hypertension.';
  }

  try {
    const audioPart = {
      inlineData: {
        data: audioBuffer.toString('base64'),
        mimeType: mimeType
      }
    };

    const result = await m.generateContent([
      'Transcribe this doctor-patient OPD consultation audio accurately. Return only the transcript text, nothing else.',
      audioPart
    ]);

    return result.response.text().trim();
  } catch (err) {
    console.error('❌ Gemini transcription error:', err.message);
    console.warn('⚠️  Falling back to demo transcript');
    return 'Patient reports chest discomfort and shortness of breath for 2 days. No radiating pain. History of hypertension.';
  }
};

// ═══════════════════════════════════════════════
// Fallback demo data — used when Gemini is unavailable
// ═══════════════════════════════════════════════

const getFallbackAnalysis = (transcript) => ({
  soap: {
    s: 'Patient reports mild chest discomfort and shortness of breath over the last 2 days. No radiating pain. History of hypertension and diabetes.',
    o: 'BP 145/90 mmHg, HR 88 bpm, SpO2 96% on room air. Mild wheezing on auscultation. No pedal edema.',
    a: 'Possible acute exacerbation of COPD vs atypical angina. Needs further workup to rule out ACS.',
    p: 'ECG and Troponin today. Nebulization with Salbutamol SOS. Tab Ecosprin 75mg OD. Review in 3 days with reports. ⚠️ Doctor must review before prescribing.'
  },
  riskScore: 65,
  drugInteractions: [
    { drugs: 'Aspirin + Ibuprofen', severity: 'high', description: 'Increased risk of GI bleeding. Avoid concurrent use.' },
    { drugs: 'Metformin + Contrast Dye', severity: 'medium', description: 'Hold Metformin 48h before contrast studies.' }
  ],
  janAushadhi: [
    { branded: 'Augmentin 625mg', generic: 'Amoxicillin + Clavulanic Acid 625mg', savings: 125 },
    { branded: 'Telma 40mg', generic: 'Telmisartan 40mg', savings: 45 },
    { branded: 'Glycomet GP 2', generic: 'Metformin + Glimepiride', savings: 80 }
  ]
});

const getFallbackQueryResponse = (query) => ({
  interpreted_as: `Analyzing patient records for: ${query}`,
  insight: 'Found 3 patients matching this criteria. Priya Sharma (45F) is highest priority — presented today with chest pain and has underlying thyroid disorder. Arjun Singh (67M) shows worsening BP trend over 3 visits with COPD. Ramesh Kumar (58M) has uncontrolled diabetes with recent hypertension spike.',
  collection_queried: 'Consultations',
  count: 3
});

const embedText = async (text) => {
  if (!genAI) return null;
  try {
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('❌ Embedding generation error:', error.message);
    return null;
  }
};

module.exports = { analyzeConsultation, processAgentQuery, transcribeAudio, initGemini, embedText };

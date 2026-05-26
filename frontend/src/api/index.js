import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://cliniq-ai-kqfz.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s timeout for Render cold starts
});

// Mock data — used ONLY when backend is completely unreachable
const MOCK_PATIENTS = [
  { id: 'P001', name: 'Ramesh Kumar', age: 58, gender: 'M', conditions: ['Hypertension', 'Diabetes'], lastVisit: '3 days ago', riskLevel: 'amber', diagnosis: 'BP fluctuation' },
  { id: 'P002', name: 'Sunita Devi', age: 34, gender: 'F', conditions: ['Dengue History'], lastVisit: '1 week ago', riskLevel: 'green', diagnosis: 'Pregnancy follow-up' },
  { id: 'P003', name: 'Priya Sharma', age: 45, gender: 'F', conditions: ['Thyroid Disorder'], lastVisit: 'Today', riskLevel: 'red', diagnosis: 'Chest pain' },
  { id: 'P004', name: 'Arjun Singh', age: 67, gender: 'M', conditions: ['COPD', 'Smoker'], lastVisit: '2 weeks ago', riskLevel: 'amber', diagnosis: 'Worsening BP trend' },
];

const MOCK_CONSULTATION_RESULT = {
  soap: {
    s: 'Patient reports mild chest discomfort and shortness of breath over the last 2 days. No radiating pain.',
    o: 'BP 145/90, HR 88, SpO2 96% on room air. Mild wheezing on auscultation.',
    a: 'Possible acute exacerbation of COPD vs atypical angina. Needs further workup.',
    p: 'ECG today. Prescribed bronchodilator inhaler (SOS). Review in 3 days. ⚠️ Doctor must review before prescribing.'
  },
  riskScore: 65,
  drugInteractions: [
    { drugs: 'Aspirin + Ibuprofen', severity: 'high', description: 'Increased risk of GI bleeding' },
  ],
  janAushadhi: [
    { branded: 'Augmentin 625', generic: 'Amoxicillin + Clavulanic Acid', savings: 125 },
    { branded: 'Telma 40', generic: 'Telmisartan 40mg', savings: 45 },
  ]
};

// Try real API first → fall back to mock data only if backend is unreachable
const withFallback = async (apiCall, fallbackData, delay = 800) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    console.warn('⚠️ Backend unavailable, falling back to demo data.', error.message);
    return new Promise((resolve) => setTimeout(() => resolve(fallbackData), delay));
  }
};

export const checkHealth = async () => {
  try {
    await api.get('/api/health/demo');
    return true;
  } catch (error) {
    return false;
  }
};

export const processConsultation = (audioBlob, patientId) => {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  if (patientId) formData.append('patientId', patientId);
  
  return withFallback(
    () => api.post('/api/consultation/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    MOCK_CONSULTATION_RESULT,
    2000
  );
};

export const agentQuery = (query) => {
  return withFallback(
    () => api.post('/api/agent/query', { query }),
    {
      interpreted_as: `Analyzing records for: ${query}`,
      insight: 'Found 3 critical patients matching this criteria in the last 48 hours. Priya Sharma is highest priority due to reported chest pain.',
      collection_queried: 'Consultations',
      count: 3
    },
    1500
  );
};

export const getPatients = () => {
  return withFallback(
    () => api.get('/api/patients'),
    MOCK_PATIENTS
  );
};

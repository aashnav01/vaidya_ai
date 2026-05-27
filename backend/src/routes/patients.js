const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// In-memory fallback patients
const FALLBACK_PATIENTS = [
  { id: 'PID-101', patientId: 'PID-101', name: 'Aarav Sharma', age: 45, gender: 'M', conditions: ['Hypertension', 'Type 2 Diabetes'], lastVisit: 'Today', riskLevel: 'amber', diagnosis: 'Uncontrolled BP' },
  { id: 'PID-102', patientId: 'PID-102', name: 'Priya Patel', age: 32, gender: 'F', conditions: ['No significant past history'], lastVisit: 'Today', riskLevel: 'red', diagnosis: 'Dengue Fever' },
  { id: 'PID-103', patientId: 'PID-103', name: 'Rohan Gupta', age: 58, gender: 'M', conditions: ['COPD', 'Smoker'], lastVisit: 'Today', riskLevel: 'red', diagnosis: 'Acute Exacerbation of COPD' },
  { id: 'PID-104', patientId: 'PID-104', name: 'Ananya Desai', age: 28, gender: 'F', conditions: ['PCOS'], lastVisit: 'Today', riskLevel: 'green', diagnosis: 'Irregular periods' },
  { id: 'PID-105', patientId: 'PID-105', name: 'Vikram Singh', age: 62, gender: 'M', conditions: ['Ischemic Heart Disease'], lastVisit: 'Today', riskLevel: 'red', diagnosis: 'Atypical chest pain' },
  { id: 'PID-106', patientId: 'PID-106', name: 'Neha Verma', age: 41, gender: 'F', conditions: ['Asthma'], lastVisit: 'Today', riskLevel: 'amber', diagnosis: 'Mild wheezing' },
  { id: 'PID-107', patientId: 'PID-107', name: 'Rajesh Kumar', age: 55, gender: 'M', conditions: ['Osteoarthritis'], lastVisit: 'Today', riskLevel: 'green', diagnosis: 'Knee joint pain' },
  { id: 'PID-108', patientId: 'PID-108', name: 'Sneha Reddy', age: 36, gender: 'F', conditions: ['Migraine'], lastVisit: 'Today', riskLevel: 'amber', diagnosis: 'Severe unilateral headache' },
  { id: 'PID-109', patientId: 'PID-109', name: 'Amit Jain', age: 50, gender: 'M', conditions: ['Hyperlipidemia'], lastVisit: 'Today', riskLevel: 'amber', diagnosis: 'High cholesterol' },
  { id: 'PID-110', patientId: 'PID-110', name: 'Kavita Iyer', age: 48, gender: 'F', conditions: ['Rheumatoid Arthritis'], lastVisit: 'Today', riskLevel: 'amber', diagnosis: 'Joint stiffness' },
  { id: 'PID-111', patientId: 'PID-111', name: 'Sanjay Bose', age: 65, gender: 'M', conditions: ['BPH'], lastVisit: 'Today', riskLevel: 'green', diagnosis: 'Frequent urination' },
  { id: 'PID-112', patientId: 'PID-112', name: 'Pooja Menon', age: 29, gender: 'F', conditions: ['Anemia'], lastVisit: 'Today', riskLevel: 'amber', diagnosis: 'Fatigue and pallor' },
  { id: 'PID-113', patientId: 'PID-113', name: 'Manish Tiwari', age: 53, gender: 'M', conditions: ['GERD'], lastVisit: 'Today', riskLevel: 'green', diagnosis: 'Acid reflux' },
  { id: 'PID-114', patientId: 'PID-114', name: 'Sunita Das', age: 60, gender: 'F', conditions: ['Osteoporosis'], lastVisit: 'Today', riskLevel: 'amber', diagnosis: 'Back pain' },
  { id: 'PID-115', patientId: 'PID-115', name: 'Rahul Joshi', age: 35, gender: 'M', conditions: ['Anxiety Disorder'], lastVisit: 'Today', riskLevel: 'green', diagnosis: 'Palpitations' },
  { id: 'PID-116', patientId: 'PID-116', name: 'Kiran Nair', age: 42, gender: 'F', conditions: ['Type 2 Diabetes'], lastVisit: 'Today', riskLevel: 'red', diagnosis: 'Diabetic foot ulcer' },
  { id: 'PID-117', patientId: 'PID-117', name: 'Deepak Chawla', age: 59, gender: 'M', conditions: ['Chronic Kidney Disease'], lastVisit: 'Today', riskLevel: 'red', diagnosis: 'Elevated creatinine' },
  { id: 'PID-118', patientId: 'PID-118', name: 'Meera Rajput', age: 31, gender: 'F', conditions: ['Endometriosis'], lastVisit: 'Today', riskLevel: 'amber', diagnosis: 'Pelvic pain' },
  { id: 'PID-119', patientId: 'PID-119', name: 'Alok Mishra', age: 47, gender: 'M', conditions: ['Fatty Liver'], lastVisit: 'Today', riskLevel: 'green', diagnosis: 'Elevated liver enzymes' },
  { id: 'PID-120', patientId: 'PID-120', name: 'Divya Kapoor', age: 54, gender: 'F', conditions: ['Hypertension'], lastVisit: 'Today', riskLevel: 'amber', diagnosis: 'Headache and dizziness' }
];

/**
 * GET /api/patients/stream
 * SSE Endpoint for real-time patient inserts
 */
router.get('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ message: 'Connected to Patient Stream' })}\n\n`);

  try {
    // Only attempt to watch if mongoose is connected
    if (require('mongoose').connection.readyState === 1) {
      const changeStream = Patient.watch([{ $match: { operationType: 'insert' } }]);
      
      changeStream.on('change', (change) => {
        const newPatient = change.fullDocument;
        res.write(`data: ${JSON.stringify({ type: 'insert', patient: newPatient })}\n\n`);
      });

      req.on('close', () => {
        changeStream.close();
      });
    } else {
      // If no DB connection, just keep the stream alive
      const keepAlive = setInterval(() => {
        res.write(': keepalive\n\n');
      }, 30000);
      req.on('close', () => clearInterval(keepAlive));
    }
  } catch (error) {
    console.error('Change stream error:', error);
    res.end();
  }
});

/**
 * GET /api/patients
 */
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().lean();
    if (patients.length > 0) {
      const mapped = patients.map(p => ({
        id: p.patientId,
        name: p.name,
        age: p.age,
        gender: p.gender,
        conditions: p.conditions,
        lastVisit: p.lastVisit,
        riskLevel: p.riskLevel,
        diagnosis: p.diagnosis
      }));
      return res.json(mapped);
    }
    // No patients in DB — return fallback
    res.json(FALLBACK_PATIENTS);
  } catch (e) {
    // MongoDB not connected
    res.json(FALLBACK_PATIENTS);
  }
});

module.exports = router;

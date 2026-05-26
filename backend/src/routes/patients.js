const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// In-memory fallback patients
const FALLBACK_PATIENTS = [
  { id: 'P001', patientId: 'P001', name: 'Ramesh Kumar', age: 58, gender: 'M', conditions: ['Hypertension', 'Diabetes'], lastVisit: '3 days ago', riskLevel: 'amber', diagnosis: 'BP fluctuation' },
  { id: 'P002', patientId: 'P002', name: 'Sunita Devi', age: 34, gender: 'F', conditions: ['Dengue History'], lastVisit: '1 week ago', riskLevel: 'green', diagnosis: 'Pregnancy follow-up' },
  { id: 'P003', patientId: 'P003', name: 'Priya Sharma', age: 45, gender: 'F', conditions: ['Thyroid Disorder'], lastVisit: 'Today', riskLevel: 'red', diagnosis: 'Chest pain' },
  { id: 'P004', patientId: 'P004', name: 'Arjun Singh', age: 67, gender: 'M', conditions: ['COPD', 'Smoker'], lastVisit: '2 weeks ago', riskLevel: 'amber', diagnosis: 'Worsening BP trend' },
];

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

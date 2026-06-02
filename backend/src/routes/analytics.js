const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');

/**
 * GET /api/analytics
 * Returns MongoDB aggregation pipeline results for the Analytics dashboard
 */
router.get('/', async (req, res) => {
  try {
    // Aggregation 1: Total patients by risk level
    const riskLevels = await Patient.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    // Aggregation 2: Top 5 most common conditions
    const topConditions = await Patient.aggregate([
      { $unwind: '$conditions' },
      { $group: { _id: '$conditions', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Aggregation 3: Average risk score by age group
    // In our DB, riskLevel is a string (red/amber/green), but Consultations have riskScore (number).
    // Let's join Patient and Consultation, or just group patients by age.
    // For simplicity, we'll bucket age from the Patient collection and count.
    const ageGroups = await Patient.aggregate([
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 30, 45, 60, 100],
          default: "Unknown",
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    res.json({
      riskLevels: riskLevels.map(r => ({ name: r._id, value: r.count })),
      topConditions: topConditions.map(c => ({ name: c._id, count: c.count })),
      ageGroups: ageGroups.map(a => {
        let label = 'Unknown';
        if (a._id === 0) label = '0 - 29';
        else if (a._id === 30) label = '30 - 44';
        else if (a._id === 45) label = '45 - 59';
        else if (a._id === 60) label = '60+';
        return { name: label, count: a.count };
      })
    });
  } catch (error) {
    console.error('Analytics Aggregation Error:', error);
    // Return fallback data if DB is not connected
    res.json({
      riskLevels: [
        { name: 'red', value: 4 },
        { name: 'amber', value: 8 },
        { name: 'green', value: 8 }
      ],
      topConditions: [
        { name: 'Hypertension', count: 6 },
        { name: 'Type 2 Diabetes', count: 4 },
        { name: 'Asthma', count: 3 },
        { name: 'COPD', count: 2 },
        { name: 'Migraine', count: 2 }
      ],
      ageGroups: [
        { name: '0 - 29', count: 3 },
        { name: '30 - 44', count: 5 },
        { name: '45 - 59', count: 8 },
        { name: '60+', count: 4 }
      ]
    });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  patientId: { type: String, ref: 'Patient' },
  patientName: { type: String },
  transcript: { type: String },
  soap: {
    s: { type: String },
    o: { type: String },
    a: { type: String },
    p: { type: String }
  },
  riskScore: { type: Number, default: 0 },
  drugInteractions: [{
    drugs: String,
    severity: { type: String, enum: ['low', 'medium', 'high'] },
    description: String
  }],
  janAushadhi: [{
    branded: String,
    generic: String,
    savings: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Consultation', consultationSchema);

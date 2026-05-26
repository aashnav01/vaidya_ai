const express = require('express');
const multer = require('multer');
const router = express.Router();
const { analyzeConsultation, transcribeAudio, embedText } = require('../services/gemini');
const Consultation = require('../models/Consultation');
const Patient = require('../models/Patient');

// Multer config — store audio in memory for Gemini processing
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

/**
 * POST /api/consultation/process
 * Accepts audio file, transcribes with Gemini, analyzes clinically, stores in MongoDB.
 */
router.post('/process', upload.single('audio'), async (req, res) => {
  try {
    const { patientId } = req.body;

    // Step 1: Transcribe audio (or use text transcript if provided)
    let transcript = req.body.transcript || '';
    if (req.file) {
      console.log(`🎤 Received audio: ${req.file.size} bytes, ${req.file.mimetype}`);
      transcript = await transcribeAudio(req.file.buffer, req.file.mimetype);
    }

    if (!transcript) {
      return res.status(400).json({ error: 'No audio file or transcript provided' });
    }

    console.log(`📝 Transcript: ${transcript.substring(0, 100)}...`);

    // Step 2: Fetch patient history if available
    let patientHistory = '';
    if (patientId) {
      try {
        const pastConsultations = await Consultation.find({ patientId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();
        if (pastConsultations.length > 0) {
          patientHistory = pastConsultations.map(c =>
            `[${c.createdAt?.toISOString().split('T')[0]}] ${c.soap?.a || 'No assessment'}`
          ).join('\n');
        }
      } catch (e) {
        // MongoDB may not be connected — continue without history
      }
    }

    // Step 3: Analyze with Gemini
    const analysis = await analyzeConsultation(transcript, patientHistory);

    // Step 3.5: Generate Vector Embedding for Atlas Vector Search
    let noteEmbedding = [];
    if (analysis.soap?.a) {
      noteEmbedding = await embedText(analysis.soap.a) || [];
    }

    let dbError = null;

    // Step 4: Save to MongoDB (if connected)
    try {
      const consultation = new Consultation({
        patientId: patientId || 'anonymous',
        patientName: req.body.patientName || '',
        transcript,
        noteEmbedding,
        ...analysis
      });
      await consultation.save();
      console.log('💾 Consultation saved to MongoDB');

      // Update patient risk level
      if (patientId) {
        await Patient.findOneAndUpdate(
          { patientId },
          {
            $set: {
              riskLevel: analysis.riskScore >= 70 ? 'red' : analysis.riskScore >= 30 ? 'amber' : 'green',
              lastVisit: new Date().toLocaleDateString('en-IN'),
              diagnosis: analysis.soap?.a?.substring(0, 60) || ''
            },
            $setOnInsert: {
              name: req.body.patientName || patientId,
              age: 0,
              gender: 'O',
              conditions: []
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    } catch (e) {
      console.warn('⚠️  Could not save to MongoDB:', e.message);
      dbError = e.message;
    }

    // Step 5: Fetch the updated list of visits to return to the frontend timeline
    let visits = [];
    if (patientId) {
      try {
        const updatedConsultations = await Consultation.find({ patientId })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();
        
        visits = updatedConsultations.map(c => ({
          date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
          diagnosis: (c.soap?.a || 'General Consultation').substring(0, 40),
          doctor: 'Dr. AI',
          notes: (c.soap?.p || '').substring(0, 100)
        }));
      } catch (e) {
        console.warn('Could not fetch updated visits');
      }
    }

    res.json({ ...analysis, visits, _debug: { dbError } });
  } catch (error) {
    console.error('❌ Consultation processing error:', error);
    res.status(500).json({ error: 'Failed to process consultation', details: error.message });
  }
});

/**
 * GET /api/consultation/:id/similar
 * Uses Atlas Vector Search to find the top 3 consultations with similar clinical presentations.
 */
router.get('/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const source = await Consultation.findById(id).lean();

    if (!source || !source.noteEmbedding || source.noteEmbedding.length === 0) {
      return res.status(404).json({ error: 'Consultation not found or has no embedding.' });
    }

    const results = await Consultation.aggregate([
      {
        $vectorSearch: {
          index: 'noteEmbedding_index',
          path: 'noteEmbedding',
          queryVector: source.noteEmbedding,
          numCandidates: 50,
          limit: 4, // Fetch 4, we'll exclude the source itself to get top 3
        }
      },
      {
        $project: {
          _id: 1,
          patientName: 1,
          'soap.a': 1,
          'soap.s': 1,
          riskScore: 1,
          createdAt: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]);

    // Filter out the source document itself
    const similar = results.filter(r => r._id.toString() !== id).slice(0, 3);
    res.json({ similar });
  } catch (error) {
    console.error('❌ Vector search error:', error.message);
    res.status(500).json({ error: 'Vector search failed', details: error.message });
  }
});

module.exports = router;

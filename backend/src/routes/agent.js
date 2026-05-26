const express = require('express');
const router = express.Router();
const { processAgentQuery } = require('../services/gemini');

/**
 * POST /api/agent/query
 * Natural-language query against the patient database, powered by Gemini + MCP.
 */
router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`🔍 Agent query: "${query}"`);

    // We no longer manually fetch patients and consultations here.
    // The Gemini agent will use MCP tools to query the database dynamically.
    const result = await processAgentQuery(query);
    res.json(result);
  } catch (error) {
    console.error('❌ Agent query error:', error);
    res.status(500).json({ error: 'Failed to process query', details: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { isMCPConnected } = require('../mcp/client');

/**
 * GET /api/health/demo
 * Used by frontend to check if backend is online
 */
router.get('/demo', (req, res) => {
  res.json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
    mcp: isMCPConnected() ? 'connected' : 'disconnected'
  });
});

module.exports = router;

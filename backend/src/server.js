require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const consultationRoutes = require('./routes/consultation');
const agentRoutes = require('./routes/agent');
const patientRoutes = require('./routes/patients');
const healthRoutes = require('./routes/health');
const analyticsRoutes = require('./routes/analytics');
const { initMCPClient } = require('./mcp/client');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/consultation', consultationRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    service: 'VaidyaAI Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'POST /api/consultation/process',
      'POST /api/agent/query',
      'GET  /api/patients',
      'GET  /api/health/demo'
    ]
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB Atlas');
    } else {
      console.warn('⚠️  MONGODB_URI not set — running without database (in-memory mode)');
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.warn('⚠️  Continuing without database (in-memory mode)');
  }

  // Initialize MCP Server
  await initMCPClient();

  app.listen(PORT, () => {
    console.log(`🚀 VaidyaAI Backend running on port ${PORT}`);
  });
};

startServer();

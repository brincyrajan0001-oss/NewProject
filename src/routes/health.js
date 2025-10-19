const express = require('express');
const { testConnection, checkPgcrypto } = require('../config/database');

const router = express.Router();

// GET /healthz - Basic health check
router.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// GET /readyz - Readiness check (database connectivity and pgcrypto)
router.get('/readyz', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    const pgcryptoAvailable = await checkPgcrypto();
    
    if (!dbConnected) {
      return res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'failed',
          pgcrypto: pgcryptoAvailable ? 'available' : 'not available'
        },
        message: 'Database connection failed'
      });
    }
    
    if (!pgcryptoAvailable) {
      return res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'connected',
          pgcrypto: 'not available'
        },
        message: 'pgcrypto extension not available'
      });
    }
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'connected',
        pgcrypto: 'available'
      }
    });
    
  } catch (error) {
    console.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;

const express = require('express');
const cors = require('cors');
const { testConnection, checkPgcrypto, pool } = require('./config/database');
const { runMigrations } = require('./migrations/migrate');
const { 
  validateApiKey, 
  createRateLimit, 
  corsOptions, 
  securityHeaders, 
  requestLogger 
} = require('./middleware/security');

const patientRoutes = require('./routes/patients');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(createRateLimit());

// Health check routes (no API key required)
app.use('/healthz', healthRoutes);
app.use('/readyz', healthRoutes);

// API routes (require API key)
app.use('/api/v1/patients', validateApiKey, patientRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      details: []
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: []
    }
  });
});

// Initialize database and start server
const initializeServer = async () => {
  try {
    console.log('🚀 Starting Patient Management API...');
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    
    // Check pgcrypto extension
    console.log('🔍 Checking pgcrypto extension...');
    const pgcryptoAvailable = await checkPgcrypto();
    if (!pgcryptoAvailable) {
      console.warn('⚠️  pgcrypto extension not available - encryption features may not work');
    }
    
    // Run migrations
    console.log('🔄 Running database migrations...');
    await runMigrations();
    
    // Set crypto key for the application
    const cryptoKey = process.env.CRYPTO_KEY || 'change-me-min-32-chars-encryption-key';
    await pool.query(`SET app.crypto_key = '${cryptoKey}'`);
    console.log('✅ Crypto key configured');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/healthz`);
      console.log(`🔍 Readiness check: http://localhost:${PORT}/readyz`);
      console.log(`📋 API documentation: http://localhost:${PORT}/api/v1/patients`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
initializeServer();

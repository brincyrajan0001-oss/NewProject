const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.API_KEY;

  console.log('apiKey', apiKey);
  console.log('expectedApiKey', expectedApiKey);
  if (!apiKey) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'API key is required',
        details: []
      }
    });
  }
  
  if (apiKey !== expectedApiKey) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid API key',
        details: []
      }
    });
  }
  
  // Store the actor for audit logging
  req.actor = `api-key:${apiKey.substring(0, 8)}...`;
  next();
};

// Rate limiting middleware
const createRateLimit = () => {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 300000; // 5 minutes
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 60;
  
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later',
        details: []
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// CORS configuration
const corsOptions = {
  origin: process.env.WEB_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'if-match', 'if-none-match'],
  credentials: true
};

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const requestId = require('crypto').randomUUID();
  req.requestId = requestId;
  
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      requestId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };
    
    console.log(JSON.stringify(logData));
  });
  
  next();
};

module.exports = {
  validateApiKey,
  createRateLimit,
  corsOptions,
  securityHeaders,
  requestLogger
};

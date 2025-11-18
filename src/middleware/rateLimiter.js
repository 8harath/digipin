const rateLimit = require('express-rate-limit');

/**
 * Rate limiting configurations for different endpoints
 */

// General API rate limiter - 1000 requests per hour
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '1 hour',
      limit: 1000,
      windowMs: 3600000
    });
  }
});

// Stricter rate limiter for batch operations - 100 requests per hour
const batchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: {
    error: 'Too many batch requests from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Batch operation rate limit exceeded',
      message: 'Too many batch requests from this IP, please try again later.',
      retryAfter: '1 hour',
      limit: 100,
      windowMs: 3600000
    });
  }
});

// Very strict rate limiter for development/testing - 10 requests per minute
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000,
  message: {
    error: 'Rate limit exceeded',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  batchLimiter,
  strictLimiter
};

/**
 * Main Server File
 * Entry point for the Express application
 */

import express from 'express';
import { appConfig } from './config/app.js';
import { initializeDatabase, initializeSchema, checkConnection } from './db/database.js';
import { securityHeaders, corsMiddleware, securityLogger, requestSizeLimiter } from './middleware/security.js';
import { generalLimiter } from './middleware/rateLimiting.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/auth.js';

// Initialize Express app
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware (must be first)
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(requestSizeLimiter);
app.use(securityLogger);

// Body parsing middleware
app.use(express.json({ limit: appConfig.requestSizeLimit }));
app.use(express.urlencoded({ extended: true, limit: appConfig.requestSizeLimit }));

// Rate limiting
app.use(generalLimiter);

// API routes
app.use(`${appConfig.apiPrefix}/auth`, authRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await checkConnection();
    return res.json({
      status: 'ok',
      message: 'Server is running',
      database: dbStatus.connected ? 'connected' : 'disconnected',
      timestamp: dbStatus.timestamp || null,
      environment: appConfig.nodeEnv,
    });
  } catch (error) {
    logger.error('Health check error', error);
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed',
    });
  }
});

// Database initialization endpoint (for setup)
app.post(`${appConfig.apiPrefix}/init-db`, async (req, res) => {
  try {
    await initializeSchema();
    return res.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    logger.error('Database initialization error', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

/**
 * Initialize database and start server
 */
async function startServer() {
  logger.info('🚀 Starting AI Agent Platform Server...\n');

  // Initialize database connection
  const dbInitialized = initializeDatabase();

  if (dbInitialized) {
    logger.success('📊 Database mode: ENABLED');
    logger.info('💾 Using: Neon PostgreSQL\n');

    // Check if schema needs initialization
    try {
      const dbCheck = await checkConnection();
      if (!dbCheck.connected) {
        logger.warn('⚠️  Database connection failed. Please check your DATABASE_URL');
      }
    } catch (error) {
      logger.warn('⚠️  Database check failed:', error.message);
    }
  } else {
    logger.warn('📊 Database mode: DISABLED (in-memory mode)');
    logger.warn('⚠️  Set DATABASE_URL to enable persistent storage\n');
  }

  // Start HTTP server
  const httpServer = app.listen(appConfig.port, () => {
    logger.success('════════════════════════════════════════');
    logger.success(`✅ Server running on port ${appConfig.port}`);
    logger.info(`📡 Health check: http://localhost:${appConfig.port}/health`);
    logger.info(`🌐 API Base: http://localhost:${appConfig.port}${appConfig.apiPrefix}`);
    logger.info(`🌍 Environment: ${appConfig.nodeEnv}`);
    logger.success('════════════════════════════════════════\n');
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    logger.warn(`\n${signal} received. Starting graceful shutdown...`);
    
    httpServer.close(async () => {
      logger.info('HTTP server closed');
      
      // Close database connections if needed
      try {
        // Add database cleanup here if needed
        logger.info('Database connections closed');
      } catch (error) {
        logger.error('Error closing database connections', error);
      }
      
      logger.info('Graceful shutdown complete');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', { promise, reason });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
}

// Start the server
startServer().catch(error => {
  logger.error('❌ Failed to start server:', error);
  process.exit(1);
});

export default app;

import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase } from './database/connection';
import { initializeSocket } from './sockets';
import { initCache } from './config/redis';

async function bootstrap() {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Init cache (Redis or in-memory fallback)
    await initCache();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    const io = initializeSocket(httpServer);

    // Attach io to app for use in controllers
    app.set('io', io);

    // Start server
    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 MatchLens AI server running on port ${env.PORT}`);
      logger.info(`📊 Environment: ${env.NODE_ENV}`);
      logger.info(`📚 API Docs: ${env.SERVER_URL}/api/docs`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', { error: error.message, stack: error.stack });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection:', { reason });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

bootstrap();

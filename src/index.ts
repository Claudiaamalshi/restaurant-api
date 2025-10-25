import app from './app';
import env from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { setupSwagger } from './config/swagger';
import './models'; // Import models to ensure they're registered

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Setup Swagger documentation
    setupSwagger(app);

    // Start server
    const server = app.listen(env.PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║  🚀 Restaurant API Server Started      ║
║  📍 Port: ${env.PORT}                        ║
║  🌍 Environment: ${env.NODE_ENV}       ║
║  📊 API Version: ${env.API_VERSION}              ║
║  📚 Docs: /api-docs                    ║
╚════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        console.log('✓ HTTP server closed');
        await disconnectDatabase();
        console.log('✓ Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
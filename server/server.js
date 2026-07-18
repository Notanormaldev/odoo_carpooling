import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { getRedisClient } from './src/config/redis.js';
import { initializeSocket } from './src/config/socket.js';
import { registerChatHandlers } from './src/sockets/chat.socket.js';
import { registerTrackingHandlers } from './src/sockets/tracking.socket.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Test Redis connection
    const redis = getRedisClient();
    await redis.ping();
    console.log('✅ Redis ping successful');

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize Socket.io
    const io = initializeSocket(httpServer);

    // Register socket handlers
    io.on('connection', (socket) => {
      registerChatHandlers(io, socket);
      registerTrackingHandlers(io, socket);
    });

    // Start listening
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT} [${process.env.NODE_ENVIRONMENT}]`);
      console.log(`📡 Socket.io ready`);
      console.log(`🏥 Health: http://localhost:${PORT}/health\n`);
    });

    // ─── Graceful Shutdown ───────────────────────────────────────────
    const shutdown = async (signal) => {
      console.log(`\n⏹ ${signal} received. Graceful shutdown...`);
      httpServer.close(async () => {
        try {
          await import('./src/config/redis.js').then(({ closeRedis }) => closeRedis());
          const mongoose = await import('mongoose');
          await mongoose.default.connection.close();
          console.log('✅ All connections closed. Bye!');
          process.exit(0);
        } catch (err) {
          console.error('❌ Error during shutdown:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection:', err.message);
      shutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

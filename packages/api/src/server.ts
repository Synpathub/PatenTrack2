import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import websocket from '@fastify/websocket';
import { getConfig, createLogger } from '@patentrack/shared';
import { getDb } from '@patentrack/db';
import { sql } from 'drizzle-orm';

const config = getConfig();
const logger = createLogger('api');
import errorHandler from './plugins/error-handler.js';
import auth from './plugins/auth.js';
import tenant from './plugins/tenant.js';
import healthRoutes from './routes/health/index.js';
import authRoutes from './routes/auth/index.js';
import profileRoutes from './routes/profile/index.js';

export async function buildServer() {
  const fastify = Fastify({
    logger: logger as any,
    requestIdLogLabel: 'traceId',
    disableRequestLogging: false,
    requestIdHeader: 'x-trace-id',
  });

  // Register CORS
  await fastify.register(cors, {
    origin: config.CORS_ORIGINS,
    credentials: true,
  });

  // Register global rate limiting (more permissive default)
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Register JWT
  await fastify.register(jwt, {
    secret: config.JWT_SECRET,
  });

  // Register Swagger
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'PatenTrack API',
        description: 'API for PatenTrack patent management system',
        version: '0.1.0',
      },
      servers: [
        {
          url: `http://${config.API_HOST}:${config.API_PORT}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Register WebSocket
  await fastify.register(websocket);

  // Register custom plugins
  await fastify.register(errorHandler);
  await fastify.register(auth);
  await fastify.register(tenant);

  // Register routes
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);
  await fastify.register(profileRoutes);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, starting graceful shutdown`);
    try {
      await fastify.close();
      logger.info('Server closed successfully');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return fastify;
}

export async function startServer() {
  const fastify = await buildServer();

  try {
    // Check database connectivity
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    logger.info('Database connection verified');

    // Start listening
    await fastify.listen({
      port: config.API_PORT,
      host: config.API_HOST,
    });

    logger.info(`Server listening on ${config.API_HOST}:${config.API_PORT}`);

    // Signal readiness to process manager
    if (process.send) {
      process.send('ready');
    }
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }

  return fastify;
}

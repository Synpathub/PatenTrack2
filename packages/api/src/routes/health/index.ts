import { FastifyPluginAsync } from 'fastify';
import { getDb } from '@patentrack/db';
import { sql } from 'drizzle-orm';

interface HealthResponse {
  status: 'ok';
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
}

interface ReadyResponse {
  status: 'ready' | 'not_ready';
  service: string;
  version: string;
  timestamp: string;
  components: {
    database: {
      status: 'ok' | 'error';
      message?: string;
    };
  };
}

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // Liveness check
  fastify.get<{ Reply: HealthResponse }>('/health', {
    schema: {
      description: 'Liveness check',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ok'] },
            service: { type: 'string' },
            version: { type: 'string' },
            uptime: { type: 'number' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  }, async (_request, _reply) => {
    return {
      status: 'ok',
      service: 'api',
      version: '0.1.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });

  // Readiness check
  fastify.get<{ Reply: ReadyResponse }>('/health/ready', {
    schema: {
      description: 'Readiness check with component status',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ready', 'not_ready'] },
            service: { type: 'string' },
            version: { type: 'string' },
            timestamp: { type: 'string' },
            components: { type: 'object' },
          },
        },
      },
    },
  }, async (_request, reply) => {
    const components: ReadyResponse['components'] = {
      database: { status: 'ok' },
    };

    let isReady = true;

    // Check database
    try {
      const db = getDb();
      await db.execute(sql`SELECT 1`);
      components.database.status = 'ok';
    } catch (err) {
      components.database.status = 'error';
      components.database.message = err instanceof Error ? err.message : 'Unknown error';
      isReady = false;
    }

    const response: ReadyResponse = {
      status: isReady ? 'ready' : 'not_ready',
      service: 'api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      components,
    };

    if (!isReady) {
      reply.status(503);
    }

    return response;
  });
};

export default healthRoutes;

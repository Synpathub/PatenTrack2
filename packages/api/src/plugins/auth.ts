import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { UnauthorizedError, ForbiddenError } from '../lib/index';
import { UserRole } from '@patentrack/core';

interface JWTPayload {
  id: string;
  tenantId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: JWTPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (role: UserRole) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    optionalAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Authenticate decorator - requires valid JWT
  fastify.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      throw new UnauthorizedError('Invalid or missing authentication token');
    }
  });

  // Role-based authorization decorator
  fastify.decorate('requireRole', (requiredRole: UserRole) => {
    return async (request: FastifyRequest, _reply: FastifyReply) => {
      if (!request.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (request.user.role !== requiredRole && request.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenError(`Requires ${requiredRole} role`);
      }
    };
  });

  // Optional authentication - tries to verify JWT but doesn't fail if missing
  fastify.decorate('optionalAuth', async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      // Ignore error, authentication is optional
    }
  });
};

export default fp(authPlugin, {
  name: 'auth',
  dependencies: ['@fastify/jwt'],
});
